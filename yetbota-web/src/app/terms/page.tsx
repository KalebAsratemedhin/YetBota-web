import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service · Yet Bota",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="May 27, 2026"
      intro="Welcome to Yet Bota. By creating an account or using the platform, you agree to these terms. Please read them carefully."
    >
      <LegalSection heading="1. Accepting these terms">
        <p>
          These Terms of Service govern your use of Yet Bota, a community-powered platform for discovering and
          mapping local places across Ethiopia. By accessing or using the service you agree to be bound by these
          terms. If you do not agree, please do not use Yet Bota.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility and accounts">
        <p>
          You must be able to verify a valid Ethiopian mobile number to create an account. You are responsible for
          keeping your credentials secure and for all activity that happens under your account. Notify us promptly of
          any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection heading="3. Community contributions">
        <p>
          Yet Bota relies on locations, photos, reviews, and answers contributed by its community. When you contribute
          content you confirm that it is accurate to the best of your knowledge, that you have the right to share it,
          and that it does not infringe anyone else&apos;s rights.
        </p>
        <p>
          You retain ownership of what you contribute, but you grant Yet Bota a worldwide, royalty-free license to
          display, distribute, and adapt that content for the purpose of operating and improving the platform.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Post false, misleading, or deliberately inaccurate location data.</li>
          <li>Harass other members, or post unlawful, hateful, or harmful content.</li>
          <li>Use the service to spam, advertise, or scrape data at scale without permission.</li>
          <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the platform.</li>
        </ul>
        <p>
          Contributions to the Q&amp;A community are also subject to our{" "}
          <a href="/guidelines" className="text-brand hover:text-brand-dark underline underline-offset-2">
            Community Guidelines
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="5. Content moderation">
        <p>
          We may review, edit, or remove content that violates these terms or our guidelines, and may suspend or
          terminate accounts that repeatedly do so. Verified place data may be cross-checked against community reports
          and other sources for accuracy.
        </p>
      </LegalSection>

      <LegalSection heading="6. Disclaimer and liability">
        <p>
          Yet Bota is provided &quot;as is.&quot; While we work with the community to keep information accurate, we do
          not guarantee that any location, listing, or answer is complete or up to date. To the fullest extent
          permitted by law, Yet Bota is not liable for damages arising from your reliance on the platform.
        </p>
      </LegalSection>

      <LegalSection heading="7. Changes to these terms">
        <p>
          We may update these terms from time to time. When we do, we will revise the date above and, for material
          changes, provide notice within the app. Continued use after changes take effect means you accept the updated
          terms.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Questions about these terms? Reach us at{" "}
          <a href="mailto:hello@yetbota.com" className="text-brand hover:text-brand-dark underline underline-offset-2">
            hello@yetbota.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
