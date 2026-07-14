export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/character", label: "דמות", icon: "⚔️" },
  { href: "/world", label: "עולם", icon: "🗺️" },
  { href: "/battles", label: "קרבות", icon: "🩸" },
  { href: "/inventory", label: "מלאי", icon: "🎒" },
  { href: "/market", label: "שוק", icon: "⚖️" },
  { href: "/clan", label: "שבט", icon: "🛡️" },
  { href: "/ranking", label: "דירוג", icon: "👑" },
  { href: "/chat", label: "צ'אט", icon: "💬" },
];
