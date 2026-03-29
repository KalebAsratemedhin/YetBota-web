export const metadata = {
  title: "AI Assistant – Yet Bota",
  description: "Ask Yet Bota AI about local events, trending spots, and community insights.",
};

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}