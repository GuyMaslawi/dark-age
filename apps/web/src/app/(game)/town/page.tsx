import { redirect } from "next/navigation";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { Scene } from "@/components/scene/Scene";
import { Hotspot } from "@/components/scene/Hotspot";
import { locationArtSrc } from "@/lib/art";

type Building = {
  href: string;
  label: string;
  sublabel: string;
  icon: string;
  tone: string;
  x: number;
  y: number;
};

const buildings: Building[] = [
  { href: "/world", label: "השער אל העולם", sublabel: "מסע וקרב", icon: "🗺️", tone: "#6fae7e", x: 20, y: 42 },
  { href: "/professions", label: "הנפחייה", sublabel: "מלאכות", icon: "⚒️", tone: "#d08a4a", x: 38, y: 66 },
  { href: "/market", label: "השוק", sublabel: "קנייה ומכירה", icon: "⚖️", tone: "#c9a227", x: 62, y: 64 },
  { href: "/inventory", label: "המחסן", sublabel: "מלאי וציוד", icon: "🎒", tone: "#b8b8b8", x: 80, y: 44 },
  { href: "/chat", label: "הטברנה", sublabel: "צ'אט", icon: "🍺", tone: "#c9552e", x: 50, y: 80 },
  { href: "/clan", label: "הטירה", sublabel: "שבט", icon: "🏰", tone: "#9aa7c2", x: 50, y: 30 },
  { href: "/ranking", label: "כס המלכות", sublabel: "דירוג", icon: "👑", tone: "#f59e0b", x: 72, y: 24 },
  { href: "/character", label: "הדמות שלך", sublabel: "מאפיינים", icon: "⚔️", tone: "#e4c04a", x: 28, y: 22 },
];

export default async function TownPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  return (
    <Scene
      slug="town"
      src={locationArtSrc("town")}
      title="עיר האם"
      subtitle="בחר לאן לפנות"
    >
      {buildings.map((b) => (
        <Hotspot
          key={b.href}
          x={b.x}
          y={b.y}
          href={b.href}
          label={b.label}
          sublabel={b.sublabel}
          icon={b.icon}
          tone={b.tone}
        />
      ))}
    </Scene>
  );
}
