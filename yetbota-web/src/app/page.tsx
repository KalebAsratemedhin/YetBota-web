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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
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
  );
}