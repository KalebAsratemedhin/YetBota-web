import {
  Navbar,
  HeroSection,
  DiscoverySection,
  AssistantSection,
  NavigationSection,
  AccuracySection,
  GamificationSection,
  PrinciplesSection,
  ChampionsSection,
  Footer,
} from "@/components/landing";
import RedirectAdminsToPortal from "@/components/admin/RedirectAdminsToPortal";

export default function HomePage() {
  return (
    <RedirectAdminsToPortal>
      {/* overflow-x-clip contains the horizontal slide-in transforms from
          <Reveal direction="left|right">, which otherwise bleed past the
          viewport edge and cause sideways scroll on small screens. */}
      <main className="min-h-screen bg-bg overflow-x-clip">
        <Navbar />
        <HeroSection />
        <PrinciplesSection />
        <NavigationSection />
        <AccuracySection />
        <GamificationSection />
        <AssistantSection />
        <DiscoverySection />
        <ChampionsSection />
        <Footer />
      </main>
    </RedirectAdminsToPortal>
  );
}