export const metadata = {
  title: "Profile – Yet Bota",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}