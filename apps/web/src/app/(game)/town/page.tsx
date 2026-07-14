import { redirect } from "next/navigation";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { Scene } from "@/components/scene/Scene";
import { AreaHotspot, type Area } from "@/components/scene/AreaHotspot";
import { locationArtSrc } from "@/lib/art";

const areas: Area[] = [
  { href: "/character", label: "הדמות שלך", sublabel: "מאפיינים וציוד", tone: "#e4c04a", x: 1, y: 6, w: 27, h: 36 },
  { href: "/clan", label: "הטירה", sublabel: "שבט", tone: "#9aa7c2", x: 35, y: 2, w: 30, h: 34 },
  { href: "/ranking", label: "כס המלכות", sublabel: "דירוג", tone: "#f59e0b", x: 71, y: 6, w: 28, h: 34 },
  { href: "/professions", label: "הנפחייה", sublabel: "מלאכות", tone: "#d08a4a", x: 1, y: 44, w: 30, h: 28 },
  { href: "/market", label: "השוק", sublabel: "קנייה ומכירה", tone: "#c9a227", x: 34, y: 40, w: 32, h: 32 },
  { href: "/inventory", label: "המחסן", sublabel: "מלאי וציוד", tone: "#b8b8b8", x: 70, y: 44, w: 29, h: 28 },
  { href: "/chat", label: "הטברנה", sublabel: "צ׳אט וחדשות", tone: "#c9552e", x: 1, y: 74, w: 30, h: 24 },
  { href: "/world", label: "השער אל העולם", sublabel: "מסע וקרב", tone: "#6fae7e", x: 33, y: 73, w: 40, h: 25 },
  { href: "/battles", label: "יומן הקרבות", sublabel: "היסטוריה", tone: "#8b1e1e", x: 74, y: 74, w: 25, h: 24 },
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
      subtitle="עבור עם העכבר על חלקי העיר ולחץ כדי להיכנס"
    >
      {areas.map((area) => (
        <AreaHotspot key={area.href} area={area} />
      ))}
    </Scene>
  );
}
