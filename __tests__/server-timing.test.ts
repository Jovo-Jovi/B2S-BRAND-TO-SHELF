import { afterEach, describe, expect, it } from "vitest";

import { closePhases, publishPhases, runWithPhases, timePhase } from "../lib/observability/phase-timing";
import { PHASES, parseServerTiming, serverTimingHeader } from "../lib/observability/server-timing";

const samples = PHASES.map((name) => ({ name, dur: 1.24 }));

function sink() {
  const headers = new Map<string, string>();
  return {
    headersSent: false,
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    setHeader(name: string, value: string | readonly string[]) {
      headers.set(name.toLowerCase(), Array.isArray(value) ? value.join(", ") : String(value));
    },
    headers,
  };
}

describe("server timing header", () => {
  const previous = process.env.VERCEL_ENV;

  afterEach(() => {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  });

  it("emits nothing in production", () => {
    expect(serverTimingHeader("production", samples)).toBeNull();
  });

  it("emits only allowlisted durations outside production", () => {
    const header = serverTimingHeader("preview", [
      ...samples,
      { name: "person@example.com", dur: 4 },
      { name: "gate-user", dur: Number.NaN },
      { name: "wall", dur: -1 },
    ]);
    expect(header).not.toBeNull();
    expect(header).not.toContain("@");
    expect(header).not.toContain("desc=");
    expect(parseServerTiming(header).map((sample) => sample.name)).toEqual([...PHASES]);
    expect(header).toMatch(/^[a-z0-9-]+;dur=\d+\.\d+(?:, [a-z0-9-]+;dur=\d+\.\d+)*$/);
  });

  it("emits on a local deployment, where the variable is unset", () => {
    expect(serverTimingHeader(undefined, [{ name: "proxy", dur: 2 }])).toBe("proxy;dur=2.0");
  });

  it("does not publish a production header from the phase bucket", async () => {
    process.env.VERCEL_ENV = "production";
    const response = sink();
    await runWithPhases(async () => {
      await timePhase("gate-user", async () => undefined);
      closePhases();
      publishPhases(response, true);
    });
    expect(response.headers.get("server-timing")).toBeUndefined();
  });

  it("publishes durations once the phases have closed", async () => {
    process.env.VERCEL_ENV = "preview";
    const response = sink();
    response.setHeader("server-timing", "proxy;dur=3.0, person@example.com;dur=9.0");
    await runWithPhases(async () => {
      await timePhase("gate-user", async () => undefined);
      publishPhases(response, false);
      expect(response.headers.get("server-timing")).toBe("proxy;dur=3.0, person@example.com;dur=9.0");
      closePhases();
      publishPhases(response, true);
    });
    const header = response.headers.get("server-timing");
    expect(header).toContain("proxy;dur=3.0");
    expect(header).toContain("gate-user;dur=");
    expect(header).toContain("wall;dur=");
    expect(header).toContain("render;dur=");
    expect(header).not.toContain("@");
  });
});
