export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installPhaseTiming } = await import("./lib/observability/install-phase-timing");
    await installPhaseTiming();
  }
}

export { onRequestError } from "./lib/observability/server-error-line";
