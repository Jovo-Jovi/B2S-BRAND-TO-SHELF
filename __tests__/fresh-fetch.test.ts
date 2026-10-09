import { EventEmitter } from "node:events";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { request, Agent } = vi.hoisted(() => ({
  request: vi.fn(),
  Agent: vi.fn(function Agent() {
    return {};
  }),
}));

vi.mock("node:https", () => ({
  default: {
    request,
    Agent,
  },
}));

import { deniedCount, runWithPhases } from "../lib/observability/phase-timing";
import { freshFetch } from "../lib/supabase/fresh-fetch";

function answer(status: number, body: string, headers: Record<string, string | string[]> = {}) {
  request.mockImplementation((_options: unknown, callback: (incoming: EventEmitter) => void) => {
    const incoming = new EventEmitter() as EventEmitter & {
      statusCode: number;
      headers: Record<string, string | string[]>;
      socket: { destroy: () => void };
    };
    incoming.statusCode = status;
    incoming.headers = headers;
    incoming.socket = { destroy: () => undefined };
    const req = new EventEmitter() as EventEmitter & {
      destroy: () => void;
      end: (payload?: Buffer) => void;
    };
    req.destroy = () => undefined;
    req.end = () => {
      queueMicrotask(() => {
        callback(incoming);
        incoming.emit("data", Buffer.from(body));
        incoming.emit("end");
      });
    };
    return req;
  });
}

describe("fresh fetch", () => {
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    request.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.test";
  });

  it("refuses a request that is not https", async () => {
    await expect(freshFetch("http://127.0.0.1/auth/v1/user")).rejects.toThrow(/https/);
    expect(request).not.toHaveBeenCalled();
  });

  it("opens one socket that is not kept alive and does not retry", async () => {
    answer(200, "{}");
    const response = await freshFetch("https://example.test/auth/v1/user", {
      headers: { apikey: "publishable" },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("{}");
    expect(Agent).toHaveBeenCalledWith({ keepAlive: false });
    expect(request).toHaveBeenCalledTimes(1);
    const options = request.mock.calls[0][0] as { headers: Record<string, string>; timeout?: number };
    expect(options.headers.connection).toBe("close");
    expect(options.timeout).toBeUndefined();
  });

  it("keeps every set-cookie", async () => {
    answer(200, "{}", { "set-cookie": ["a=1", "b=2"] });
    const response = await freshFetch("https://example.test/auth/v1/user");
    expect(response.headers.getSetCookie()).toEqual(["a=1", "b=2"]);
  });

  it("counts a denial and does not retry it", async () => {
    answer(429, "{}");
    const seen = await runWithPhases(async () => {
      const response = await freshFetch("https://example.test/rest/v1/brand");
      return { status: response.status, denied: deniedCount() };
    });
    expect(seen.status).toBe(429);
    expect(seen.denied).toBe(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("sends a form with its boundary", async () => {
    answer(200, "{}");
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("file", new Blob([Uint8Array.from([1, 2, 3])]), "a.png");
    await freshFetch("https://example.test/storage/v1/object/a", { method: "POST", body: form });
    const options = request.mock.calls[0][0] as { headers: Record<string, string> };
    expect(options.headers["content-type"]).toContain("multipart/form-data");
    expect(Number(options.headers["content-length"])).toBeGreaterThan(0);
  });

  afterEach(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  });
});
