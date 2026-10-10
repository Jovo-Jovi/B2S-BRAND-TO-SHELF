// SECURITY_MODEL.md §6, unhandled server errors. One JSON line. The message
// is scrubbed and truncated here, and nothing else from the request is read.

export const SERVER_ERROR_EVENT = "server_error";
export const REDACTED = "<REDACTED>";

const MESSAGE_LIMIT = 200;
const SQLSTATE = /^[0-9A-Z]{5}$/;
const CONSTRAINT = /^[A-Za-z0-9_]{1,63}$/;
const TENANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FRAME_LIMIT = 10;

const loggedErrors = new WeakSet<object>();

export type ServerErrorRequest = {
  path: string;
  method: string;
  headers: NodeJS.Dict<string | string[]>;
};

export type ServerErrorContext = {
  routerKind: string;
  routePath: string;
};

function emailPattern(): RegExp {
  return /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
}

function phonePattern(): RegExp {
  const international = "\\+" + "\\d{1,3}(?:[\\s().-]*\\d){6,14}";
  const egyptianMobile = "\\b01[0125](?:[\\s.-]*\\d){8}\\b";
  const egyptianLandline = "\\b0[2-9](?:[\\s.-]*\\d){7,8}\\b";
  return new RegExp(`${international}|${egyptianMobile}|${egyptianLandline}`, "g");
}

export function redactPersonalData(value: string): string {
  return value.replace(emailPattern(), REDACTED).replace(phonePattern(), REDACTED);
}

function clip(value: string, limit: number): string {
  return value.length > limit ? value.slice(0, limit) : value;
}

export function scrubbedMessage(message: string): string {
  return clip(redactPersonalData(message), MESSAGE_LIMIT);
}

function headerValue(headers: NodeJS.Dict<string | string[]>, name: string): string | null {
  const raw = headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value === "") return null;
  return clip(redactPersonalData(value), MESSAGE_LIMIT);
}

function asObject(error: unknown): object | null {
  return error !== null && typeof error === "object" ? error : null;
}

function stringField(error: object, key: string): string | null {
  const value = (error as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function databaseFields(error: unknown): { databaseCode: string | null; constraint: string | null } {
  const sources: object[] = [];
  const own = asObject(error);
  if (own) sources.push(own);
  const cause = own ? (own as { cause?: unknown }).cause : null;
  const causeObject = asObject(cause);
  if (causeObject) sources.push(causeObject);

  let databaseCode: string | null = null;
  let constraint: string | null = null;
  for (const source of sources) {
    if (databaseCode === null) {
      const code = stringField(source, "code");
      if (code && SQLSTATE.test(code)) databaseCode = code;
    }
    if (constraint === null) {
      const name = stringField(source, "constraint");
      if (name) {
        const redacted = redactPersonalData(name);
        if (CONSTRAINT.test(redacted)) constraint = redacted;
      }
    }
  }
  return { databaseCode, constraint };
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function nameOf(error: unknown): string {
  if (error instanceof Error && error.name) return error.name;
  return "Error";
}

function digestOf(error: unknown): string {
  const own = asObject(error);
  const digest = own ? stringField(own, "digest") : null;
  if (!digest) return "";
  return clip(redactPersonalData(digest), 128);
}

function tenantField(tenantId: string | null): string | null {
  if (tenantId && TENANT_ID.test(tenantId)) return tenantId;
  return null;
}

function frameFile(file: string): string {
  let path = file.replaceAll("\\", "/");
  if (path.startsWith("file://")) {
    path = path.slice("file://".length);
    if (/^\/[A-Za-z]:\//.test(path)) path = path.slice(1);
  }
  for (const root of ["app/", "lib/", "components/", "features/"]) {
    const at = path.lastIndexOf(`/${root}`);
    if (at !== -1) return path.slice(at + 1);
    if (path.startsWith(root)) return path;
  }
  const slash = path.lastIndexOf("/");
  return slash === -1 ? path : path.slice(slash + 1);
}

function framesOf(error: unknown): Array<{ function: string; location: string }> {
  const stack = error instanceof Error ? error.stack : undefined;
  if (!stack) return [];
  const frames: Array<{ function: string; location: string }> = [];
  for (const line of stack.split("\n")) {
    const match = line.match(/^\s*at\s+(?:async\s+)?(?:(.+?)\s+\()?(.+):(\d+):\d+\)?\s*$/);
    if (!match) continue;
    const fn = match[1] ? clip(redactPersonalData(match[1]), 80) : "";
    const file = frameFile(match[2]);
    frames.push({ function: fn, location: `${file}:${match[3]}` });
    if (frames.length === FRAME_LIMIT) break;
  }
  return frames;
}

export function serverErrorLine(
  error: unknown,
  request: ServerErrorRequest,
  context: ServerErrorContext,
  timestamp: string,
  tenantId: string | null,
): string {
  const database = databaseFields(error);
  return JSON.stringify({
    event: SERVER_ERROR_EVENT,
    digest: digestOf(error),
    platformRequestId: headerValue(request.headers, "x-vercel-id"),
    route: clip(redactPersonalData(context.routePath), MESSAGE_LIMIT),
    routerKind: clip(redactPersonalData(context.routerKind), 40),
    method: clip(redactPersonalData(request.method), 16),
    errorName: clip(redactPersonalData(nameOf(error)), 80),
    databaseCode: database.databaseCode,
    constraint: database.constraint,
    message: scrubbedMessage(messageOf(error)),
    frames: framesOf(error),
    tenantId: tenantField(tenantId),
    timestamp,
  });
}

export function onRequestError(
  error: unknown,
  request: ServerErrorRequest,
  context: ServerErrorContext,
): void {
  const own = asObject(error);
  if (own) {
    if (loggedErrors.has(own)) return;
    loggedErrors.add(own);
  }
  console.error(
    serverErrorLine(error, request, context, new Date().toISOString(), null),
  );
}
