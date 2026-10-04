import { describe, expect, it } from "vitest";

import {
  REDACTED,
  type ServerErrorContext,
  type ServerErrorRequest,
  serverErrorLine,
} from "../lib/observability/server-error-line";

const TIMESTAMP = "2026-10-04T00:00:00.000Z";
const CONTEXT: ServerErrorContext = {
  routerKind: "App Router",
  routePath: "/[locale]/error-probe",
};

function request(headers: ServerErrorRequest["headers"] = {}): ServerErrorRequest {
  return {
    path: "/en/error-probe?q=TYPEDSECRET",
    method: "GET",
    headers,
  };
}

function lineFor(error: unknown, headers: ServerErrorRequest["headers"] = {}, tenantId: string | null = null) {
  return JSON.parse(serverErrorLine(error, request(headers), CONTEXT, TIMESTAMP, tenantId)) as {
    event: string;
    digest: string;
    platformRequestId: string | null;
    route: string;
    routerKind: string;
    method: string;
    errorName: string;
    databaseCode: string | null;
    constraint: string | null;
    message: string;
    frames: Array<{ function: string; location: string }>;
    tenantId: string | null;
    timestamp: string;
  };
}

describe("server error line", () => {
  it("replaces an email address", () => {
    const record = lineFor(new Error("failed for person@example.com"));
    expect(record.message).toBe(`failed for ${REDACTED}`);
    expect(record.message).not.toContain("person@example.com");
  });

  it("replaces an international phone number", () => {
    const record = lineFor(new Error("call +20 10 1234 5678 now"));
    expect(record.message).toBe(`call ${REDACTED} now`);
    expect(record.message).not.toContain("+20");
  });

  it("replaces an international phone number written with dashes", () => {
    const record = lineFor(new Error("call +1-202-555-0147 now"));
    expect(record.message).toBe(`call ${REDACTED} now`);
    expect(record.message).not.toContain("202");
  });

  it("replaces an Egyptian mobile number", () => {
    const record = lineFor(new Error("mobile 01012345678"));
    expect(record.message).toBe(`mobile ${REDACTED}`);
  });

  it("replaces an Egyptian mobile number written with spaces", () => {
    const record = lineFor(new Error("mobile 010 1234 5678"));
    expect(record.message).toBe(`mobile ${REDACTED}`);
  });

  it("replaces an Egyptian mobile number written with dashes", () => {
    const record = lineFor(new Error("mobile 010-1234-5678"));
    expect(record.message).toBe(`mobile ${REDACTED}`);
  });

  it("replaces an Egyptian landline", () => {
    const record = lineFor(new Error("landline 02 2345 6789"));
    expect(record.message).toBe(`landline ${REDACTED}`);
  });

  it("truncates the scrubbed message at 200 characters", () => {
    const record = lineFor(new Error("a".repeat(250)));
    expect(record.message).toHaveLength(200);
    expect(record.message).toBe("a".repeat(200));
  });

  it("scrubs an email that begins inside the first 200 characters", () => {
    const message = `${"a".repeat(180)} person@example.com ${"b".repeat(40)}`;
    const record = lineFor(new Error(message));
    expect(record.message).toHaveLength(200);
    expect(record.message).not.toContain("person@example.com");
    expect(record.message).toContain(REDACTED);
  });

  it("keeps a database code and constraint, and drops detail, body, cookies and other headers", () => {
    const error = Object.assign(new Error("failed for messageperson@example.com"), {
      code: "23505",
      constraint: "member_email_key",
      detail: "DETAILSECRET",
      details: "DETAILSSECRET",
      hint: "HINTSECRET",
      body: "BODYSECRET",
      digest: "digest-1",
    });
    const record = lineFor(error, {
      "x-vercel-id": "vercel-req-1",
      cookie: "COOKIESECRET",
      authorization: "TOKENSECRET",
      "x-member-email": "member@example.com",
    });
    const serialised = JSON.stringify(record);

    expect(record.event).toBe("server_error");
    expect(record.digest).toBe("digest-1");
    expect(record.platformRequestId).toBe("vercel-req-1");
    expect(record.route).toBe("/[locale]/error-probe");
    expect(record.routerKind).toBe("App Router");
    expect(record.method).toBe("GET");
    expect(record.errorName).toBe("Error");
    expect(record.databaseCode).toBe("23505");
    expect(record.constraint).toBe("member_email_key");
    expect(record.tenantId).toBeNull();
    expect(record.timestamp).toBe(TIMESTAMP);
    expect(record.message).toBe(`failed for ${REDACTED}`);

    expect(serialised).not.toContain("DETAILSECRET");
    expect(serialised).not.toContain("DETAILSSECRET");
    expect(serialised).not.toContain("HINTSECRET");
    expect(serialised).not.toContain("BODYSECRET");
    expect(serialised).not.toContain("COOKIESECRET");
    expect(serialised).not.toContain("TOKENSECRET");
    expect(serialised).not.toContain("member@example.com");
    expect(serialised).not.toContain("messageperson@example.com");
    expect(serialised).not.toContain("TYPEDSECRET");
    expect(serialised).not.toContain("cookie");
  });

  it("drops a constraint that is an email address", () => {
    const error = Object.assign(new Error("probe"), {
      constraint: "person@example.com",
    });
    const record = lineFor(error);
    expect(record.constraint).toBeNull();
    expect(JSON.stringify(record)).not.toContain("person@example.com");
  });

  it("records a tenant id and refuses an email in that field", () => {
    const tenant = "11111111-1111-4111-8111-111111111111";
    expect(lineFor(new Error("probe"), {}, tenant).tenantId).toBe(tenant);
    expect(lineFor(new Error("probe"), {}, "person@example.com").tenantId).toBeNull();
  });

  it("keeps ten frames as function and file:line, and drops an absolute path", () => {
    const error = new Error("probe");
    const lines = ["Error: probe"];
    for (let index = 1; index <= 12; index += 1) {
      lines.push(`    at step${index} (C:\\Users\\Outside\\secret\\frame-${index}.ts:${index}:99)`);
    }
    error.stack = lines.join("\n");
    const record = lineFor(error);
    expect(record.frames).toHaveLength(10);
    expect(record.frames[0]).toEqual({ function: "step1", location: "frame-1.ts:1" });
    expect(record.frames[9].location).toBe("frame-10.ts:10");
    const serialised = JSON.stringify(record);
    expect(serialised).not.toContain("Outside");
    expect(serialised).not.toContain("secret");
    expect(serialised).not.toContain(":99");
  });
});
