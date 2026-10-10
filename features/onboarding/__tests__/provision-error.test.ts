import { describe, expect, it } from "vitest";

import { provisionRefusal } from "../provision-error";

describe("provision refusal", () => {
  it("names the ownership cap and the daily cap", () => {
    expect(provisionRefusal("tenant provisioning refused: a member may own at most three active tenants")).toBe("cap");
    expect(provisionRefusal("tenant provisioning refused: at most three provisioning acts are permitted per 24 hours")).toBe("rate");
    expect(provisionRefusal("tenant provisioning refused: a tenant must carry a name")).toBe("refused");
  });
});
