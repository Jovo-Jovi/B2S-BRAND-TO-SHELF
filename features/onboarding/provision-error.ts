export type ProvisionRefusal = "cap" | "rate" | "refused";

// The two OD-G18 sentences are raised by provision_tenant. Both use
// check_violation, so the wording is what distinguishes them.
export function provisionRefusal(message: string): ProvisionRefusal {
  if (message.includes("at most three active tenants")) return "cap";
  if (message.includes("per 24 hours")) return "rate";
  return "refused";
}
