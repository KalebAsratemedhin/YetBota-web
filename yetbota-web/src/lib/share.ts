// Social share links shared by the post-detail action cluster and the
// discovery feed cards, so both expose the same set of targets.

export interface ShareTarget {
  id: string;
  label: string;
  href: string;
}

export function buildShareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { id: "x", label: "X (Twitter)", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { id: "email", label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
}
