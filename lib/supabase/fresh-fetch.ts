import https from "node:https";
import type { IncomingHttpHeaders } from "node:http";

import { noteUpstreamDenied } from "@/lib/observability/phase-timing";

// An idle socket kept for the next call is often already closed at the other
// end. Reusing it waits out a TCP timeout, which is one call taking tens of
// seconds while every call beside it stays fast. A new socket per call cannot
// be that leftover. This is not a timeout and not a retry.

const agent = new https.Agent({ keepAlive: false });
const REDIRECT = new Set([301, 302, 303, 307, 308]);

type Encoded = { payload?: Buffer; type?: string };

export function freshFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const body = init && "body" in init ? init.body : input instanceof Request ? input.body : undefined;
  const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const follow = (init?.redirect ?? "follow") === "follow";
  return request(resolveTarget(input, init), method, body, signal, follow, 0);
}

function resolveTarget(input: RequestInfo | URL, init?: RequestInit): { url: URL; headers: Headers } {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  headers.delete("host");
  headers.delete("content-length");
  headers.set("connection", "close");
  return { url, headers };
}

async function request(
  target: { url: URL; headers: Headers },
  method: string,
  body: BodyInit | null | undefined,
  signal: AbortSignal | null | undefined,
  follow: boolean,
  redirects: number,
): Promise<Response> {
  if (target.url.protocol !== "https:") {
    throw new Error("fresh fetch refuses a request that is not https");
  }
  const encoded = await encodeBody(body);
  if (encoded.type) target.headers.set("content-type", encoded.type);
  if (encoded.payload) target.headers.set("content-length", String(encoded.payload.length));
  const response = await once(target.url, method, target.headers, encoded.payload, signal);
  noteUpstreamDenied(response.status === 429 ? target.url.host : null);
  if (!follow || !REDIRECT.has(response.status) || redirects >= 5) return response;
  const location = response.headers.get("location");
  if (!location) return response;
  const next = new URL(location, target.url);
  const headers = new Headers(target.headers);
  headers.delete("content-length");
  if (next.host !== target.url.host) {
    headers.delete("authorization");
    headers.delete("apikey");
    headers.delete("cookie");
  }
  const nextMethod = response.status === 307 || response.status === 308 ? method : "GET";
  return request({ url: next, headers }, nextMethod, undefined, signal, follow, redirects + 1);
}

function once(
  url: URL,
  method: string,
  headers: Headers,
  payload: Buffer | undefined,
  signal: AbortSignal | null | undefined,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: Object.fromEntries(headers.entries()),
        agent,
      },
      (incoming) => {
        const chunks: Buffer[] = [];
        incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
        incoming.on("end", () => {
          incoming.socket?.destroy();
          finish(() => {
            resolve(
              new Response(Buffer.concat(chunks), {
                status: incoming.statusCode ?? 500,
                headers: flatHeaders(incoming.headers),
              }),
            );
          });
        });
        incoming.on("error", (error) => {
          req.destroy();
          finish(() => reject(error));
        });
      },
    );
    const fail = (error: unknown) => {
      req.destroy();
      finish(() => reject(error instanceof Error ? error : new Error("fresh fetch failed")));
    };
    req.on("error", fail);
    if (signal) {
      const onAbort = () => {
        fail(signal.reason instanceof Error ? signal.reason : new Error("fresh fetch aborted"));
      };
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
      req.on("close", () => signal.removeEventListener("abort", onAbort));
    }
    if (payload) req.end(payload);
    else req.end();
  });
}

function flatHeaders(headers: IncomingHttpHeaders): Headers {
  const out = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) out.append(name, item);
    } else {
      out.set(name, value);
    }
  }
  return out;
}

async function encodeBody(body: BodyInit | null | undefined): Promise<Encoded> {
  if (body == null) return {};
  if (typeof body === "string") return { payload: Buffer.from(body) };
  if (body instanceof URLSearchParams) return { payload: Buffer.from(body.toString()) };
  if (typeof FormData !== "undefined" && body instanceof FormData) return formBytes(body);
  if (body instanceof Uint8Array) return { payload: Buffer.from(body) };
  if (body instanceof ArrayBuffer) return { payload: Buffer.from(body) };
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return { payload: Buffer.from(await body.arrayBuffer()) };
  }
  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return { payload: Buffer.from(await new Response(body).arrayBuffer()) };
  }
  throw new Error("fresh fetch refuses this request body");
}

async function formBytes(body: FormData): Promise<Encoded> {
  const probe = new Request(new URL("/", `${"https:"}//localhost`), { method: "POST", body });
  const type = probe.headers.get("content-type");
  if (!type) throw new Error("fresh fetch could not encode the form");
  return { payload: Buffer.from(await probe.arrayBuffer()), type };
}
