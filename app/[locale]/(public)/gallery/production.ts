// The gallery is a review surface. Vercel sets VERCEL_ENV to "production"
// on the production deployment and to "preview" on preview deployments
// (OD-G9). Anywhere that variable is not "production" — local, CI, preview —
// the route is served.

export function galleryRefused(vercelEnv: string | undefined): boolean {
  return vercelEnv === "production";
}
