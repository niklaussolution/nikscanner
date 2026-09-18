import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        This is placeholder legal copy for the NIKSCANNER product build. Replace it with counsel-reviewed content
        before launch.
      </p>
      <h2 className="font-heading text-base font-semibold text-white">Data we collect</h2>
      <p>Account details, scan targets you submit, and basic device/browser metadata used for fraud prevention.</p>
      <h2 className="font-heading text-base font-semibold text-white">How we use it</h2>
      <p>To provide scanning results, improve detection accuracy, and secure the platform.</p>
      <h2 className="font-heading text-base font-semibold text-white">Retention</h2>
      <p>Scan data is retained according to your plan&apos;s history window and may be aggregated anonymously for threat intelligence.</p>
    </LegalPage>
  );
}
