import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 2026">
      <p>
        This is placeholder legal copy for the NIKSCANNER product build. Replace it with counsel-reviewed content
        before launch.
      </p>
      <h2 className="font-heading text-base font-semibold text-white">Acceptable use</h2>
      <p>
        You may not use the scanning API to target infrastructure you don&apos;t own or have authorization to test,
        or to attempt to bypass rate limits or SSRF protections.
      </p>
      <h2 className="font-heading text-base font-semibold text-white">Accounts</h2>
      <p>You are responsible for activity under your account and API keys.</p>
    </LegalPage>
  );
}
