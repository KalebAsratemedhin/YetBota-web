import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Community Guidelines · Yet Bota",
};

export default function GuidelinesPage() {
  return (
    <LegalLayout
      title="Community Guidelines"
      updated="May 27, 2026"
      intro="Yet Bota's Q&A is built by neighbors helping neighbors. These guidelines keep it a useful, respectful, and safe place for everyone exploring Ethiopia."
    >
      <LegalSection heading="Be respectful">
        <p>
          Treat other members the way you would in your own neighborhood. Disagree with ideas, not people. Harassment,
          hate speech, threats, and personal attacks are not allowed.
        </p>
      </LegalSection>

      <LegalSection heading="Stay on topic">
        <p>
          Questions and answers should be about local places, directions, and discovery. Keep posts relevant so others
          can find help quickly. Off-topic or duplicate posts may be removed.
        </p>
      </LegalSection>

      <LegalSection heading="Keep it accurate">
        <p>
          Share what you actually know. When answering about a place, be specific and honest — wrong directions or
          made-up details waste people&apos;s time and erode trust. If you&apos;re not sure, say so.
        </p>
      </LegalSection>

      <LegalSection heading="No spam or self-promotion">
        <p>
          Don&apos;t use the community to advertise, post referral links, or repeatedly promote a business. Helpful,
          genuine recommendations are welcome; spam is not.
        </p>
      </LegalSection>

      <LegalSection heading="Respect privacy and safety">
        <p>
          Don&apos;t share someone else&apos;s private information, and think twice before posting precise details that
          could put a person or place at risk. Never post content that endangers others.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting and enforcement">
        <p>
          If you see content that breaks these guidelines, report it so moderators can review. We may edit or remove
          posts, and suspend accounts that repeatedly violate the rules. Use of Yet Bota is also subject to our{" "}
          <a href="/terms" className="text-brand hover:text-brand-dark underline underline-offset-2">
            Terms of Service
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
