import { ThemeFromQuery } from "@/features/onboarding/components/theme-from-query";

export const dynamic = "force-dynamic";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeFromQuery />
      {children}
    </>
  );
}
