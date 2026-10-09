import http from "node:http";

import { ensureWorkBucket, noteUpstreamDenied, publishPhases } from "./phase-timing";

let installed = false;

export async function installPhaseTiming(): Promise<void> {
  if (installed) return;
  if (process.env.VERCEL_ENV === "production") return;
  await patchRenderScope();
  patchResponse();
  patchFetch();
  installed = true;
}

function patchResponse(): void {
  const proto = http.ServerResponse.prototype as unknown as Record<
    "write" | "end" | "writeHead" | "flushHeaders",
    (this: http.ServerResponse, ...args: unknown[]) => unknown
  >;
  const original = {
    write: proto.write,
    end: proto.end,
    writeHead: proto.writeHead,
    flushHeaders: proto.flushHeaders,
  };
  proto.write = function write(this: http.ServerResponse, ...args: unknown[]) {
    publishPhases(this, false);
    return original.write.apply(this, args);
  };
  proto.end = function end(this: http.ServerResponse, ...args: unknown[]) {
    publishPhases(this, true);
    return original.end.apply(this, args);
  };
  proto.writeHead = function writeHead(this: http.ServerResponse, ...args: unknown[]) {
    publishPhases(this, true);
    return original.writeHead.apply(this, args);
  };
  proto.flushHeaders = function flushHeaders(this: http.ServerResponse, ...args: unknown[]) {
    publishPhases(this, false);
    return original.flushHeaders.apply(this, args);
  };
}

function patchFetch(): void {
  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await original(input, init);
    if (response.status === 429) noteUpstreamDenied(requestHost(input));
    return response;
  };
}

async function patchRenderScope(): Promise<void> {
  // The render store's run() wraps the whole server render, including the
  // write that sends the headers. The phase bucket has to be active there,
  // or the durations are gone before the header can be set.
  const loaded = (await import("next/dist/server/app-render/work-async-storage.external")) as {
    workAsyncStorage: {
      run: (store: unknown, fn: (...args: unknown[]) => unknown, ...args: unknown[]) => unknown;
    };
  };
  const store = loaded.workAsyncStorage;
  const original = store.run.bind(store);
  store.run = (workStore, fn, ...args) => {
    if (workStore && typeof workStore === "object") ensureWorkBucket(workStore);
    return original(workStore, fn, ...args);
  };
}

function requestHost(input: RequestInfo | URL): string | null {
  try {
    if (typeof input === "string") return new URL(input).host;
    if (input instanceof URL) return input.host;
    return new URL(input.url).host;
  } catch {
    return null;
  }
}
