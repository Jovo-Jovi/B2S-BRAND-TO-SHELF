import { AsyncLocalStorage } from "node:async_hooks";

import { workAsyncStorage } from "next/dist/server/app-render/work-async-storage.external";

import {
  parseServerTiming,
  serverTimingHeader,
  type PhaseName,
  type PhaseSample,
} from "./server-timing";

type Bucket = {
  started: number;
  closedAt: number | null;
  samples: PhaseSample[];
  denied: number;
};

type HeaderSink = {
  headersSent: boolean;
  getHeader(name: string): number | string | string[] | undefined;
  setHeader(name: string, value: string | readonly string[]): void;
};

const PHASE_BUCKET = Symbol.for("b2s.onboardingPhases");
const STORAGE_KEY = Symbol.for("b2s.onboardingPhaseStorage");

type StorageHost = typeof globalThis & {
  [STORAGE_KEY]?: AsyncLocalStorage<Bucket>;
};

function sharedStorage(): AsyncLocalStorage<Bucket> {
  const host = globalThis as StorageHost;
  if (!host[STORAGE_KEY]) host[STORAGE_KEY] = new AsyncLocalStorage();
  return host[STORAGE_KEY];
}

const published = new WeakSet<object>();

type WorkStoreLike = {
  route?: string;
  page?: string;
} & Record<symbol, Bucket | undefined>;

export function ensureWorkBucket(store: object): void {
  const target = store as WorkStoreLike;
  const route = `${target.route ?? ""} ${target.page ?? ""}`;
  if (!route.includes("onboarding")) return;
  if (!target[PHASE_BUCKET]) target[PHASE_BUCKET] = createBucket();
}

function bucket(): Bucket | undefined {
  try {
    const store = workAsyncStorage.getStore() as WorkStoreLike | undefined;
    if (store?.[PHASE_BUCKET]) return store[PHASE_BUCKET];
  } catch {
    // The render store is absent in tests and outside a request.
  }
  return sharedStorage().getStore();
}

export async function timePhase<T>(name: PhaseName, work: () => PromiseLike<T>): Promise<T> {
  const start = performance.now();
  try {
    return await work();
  } finally {
    const current = bucket();
    if (current) {
      const dur = performance.now() - start;
      if (Number.isFinite(dur) && dur >= 0) current.samples.push({ name, dur });
    }
  }
}

export function closePhases(): void {
  const current = bucket();
  if (!current || current.closedAt !== null) return;
  current.closedAt = performance.now();
}

export function noteUpstreamDenied(host: string | null): void {
  const current = bucket();
  if (!current || !host) return;
  const configured = configuredHost();
  if (!configured || host !== configured) return;
  current.denied += 1;
}

export function deniedCount(): number {
  return bucket()?.denied ?? 0;
}

export function runWithPhases<T>(fn: () => T): T {
  return sharedStorage().run(createBucket(), fn);
}

export function enterPhaseScope<T>(fn: () => T): T {
  if (sharedStorage().getStore()) return fn();
  return sharedStorage().run(createBucket(), fn);
}

export function publishPhases(res: HeaderSink, finishing: boolean): void {
  if (published.has(res) || res.headersSent) return;
  const current = bucket();
  if (!current) return;
  if (!finishing && current.closedAt === null) return;
  if (current.samples.length === 0 && current.denied === 0) {
    if (finishing && current.closedAt !== null) published.add(res);
    return;
  }
  const now = performance.now();
  const closedAt = current.closedAt ?? now;
  const samples: PhaseSample[] = [
    ...parseServerTiming(headerValue(res.getHeader("server-timing"))),
    ...current.samples,
    { name: "wall", dur: now - current.started },
    { name: "render", dur: Math.max(0, now - closedAt) },
  ];
  if (current.denied > 0) samples.push({ name: "http-429", dur: current.denied });
  const header = serverTimingHeader(process.env.VERCEL_ENV, samples);
  published.add(res);
  if (!header) return;
  res.setHeader("server-timing", header);
}

function createBucket(): Bucket {
  return { started: performance.now(), closedAt: null, samples: [], denied: 0 };
}

function headerValue(value: number | string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  return "";
}

function configuredHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}
