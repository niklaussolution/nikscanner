import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Responsible Disclosure" };

export default function DisclosurePage() {
  return (
    <LegalPage title="Responsible Disclosure" updated="September 2026">
      <p>
        If you believe you&apos;ve found a security vulnerability in NIKSCANNER, please report it privately to
        security@nikscanner.com rather than filing a public issue.
      </p>
      <h2 className="font-heading text-base font-semibold text-white">Scope</h2>
      <p>The web application, public API, and mobile apps are in scope. Third-party integrations are out of scope.</p>
      <h2 className="font-heading text-base font-semibold text-white">Our commitment</h2>
      <p>We will acknowledge reports within 3 business days and keep you updated as we investigate and remediate.</p>
    </LegalPage>
  );
}
