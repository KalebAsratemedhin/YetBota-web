import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy · Yet Bota",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="May 27, 2026"
      intro="This policy explains what information Yet Bota collects, how we use it, and the choices you have. We aim to collect only what we need to run the platform."
    >
      <LegalSection heading="1. Information we collect">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <span className="text-fg font-medium">Account details</span> — your name, username, and mobile number
            used to create and verify your account.
          </li>
          <li>
            <span className="text-fg font-medium">Contributions</span> — places, photos, reviews, questions, and
            answers you add to the platform.
          </li>
          <li>
            <span className="text-fg font-medium">Location data</span> — coordinates you attach to a contribution, or
            that you choose to share to find nearby places.
          </li>
          <li>
            <span className="text-fg font-medium">Usage data</span> — basic technical information needed to keep the
            service secure and working.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Operate your account and verify your identity by SMS.</li>
          <li>Display community contributions and power local discovery.</li>
          <li>Improve accuracy, moderate content, and keep the platform safe.</li>
          <li>Send you notifications you have opted into.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Sharing">
        <p>
          Public contributions — such as places you add and answers you post — are visible to other members by design.
          We do not sell your personal information. We share data with service providers (for example, the SMS
          provider that delivers verification codes) only as needed to operate Yet Bota, and where required by law.
        </p>
      </LegalSection>

      <LegalSection heading="4. Data retention">
        <p>
          We keep account information for as long as your account is active. You can request deletion of your account
          at any time; some contributions may remain in anonymized form to preserve the integrity of community data.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your choices">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Access and update your profile information from your account settings.</li>
          <li>Control notification preferences in the app.</li>
          <li>Request a copy or deletion of your data by contacting us.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Storage on your device">
        <p>
          We store a small amount of data in your browser (such as your session and language preference) so you stay
          signed in and the app remembers your settings. Clearing your browser storage will sign you out.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact">
        <p>
          For privacy questions or data requests, contact us at{" "}
          <a href="mailto:privacy@yetbota.com" className="text-brand hover:text-brand-dark underline underline-offset-2">
            privacy@yetbota.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
