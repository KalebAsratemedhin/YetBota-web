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
      <main className="min-h-screen bg-bg">
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