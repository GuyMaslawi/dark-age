import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const artDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");

const STYLE =
  "dark fantasy, painterly digital illustration, cinematic dramatic lighting, muted desaturated palette with gold and ember accents, highly detailed, moody grim atmosphere, no text, no watermark, no logo, no UI elements";

const locations = [
  { slug: "misty-vale", en: "The Misty Vale", scene: "a green valley wrapped in permanent fog, gateway to the world, faint sunlight through mist, twisted trees" },
  { slug: "shadow-forest", en: "The Shadow Forest", scene: "a dense dark forest where sunlight barely reaches, glowing eyes between the trunks, thick undergrowth" },
  { slug: "rot-marshes", en: "The Rot Marshes", scene: "a fetid swamp of sinking mud, poisonous green mist, dead trees and bubbling water" },
  { slug: "fallen-mines", en: "The Fallen Mines", scene: "abandoned mine tunnels dug too deep, broken supports, faint ominous glow from below, dust and rubble" },
  { slug: "ash-desert", en: "The Ash Desert", scene: "a scorched wasteland to the horizon, hot ash blowing on the wind over whitened bones" },
  { slug: "frost-ridge", en: "The Frost Ridge", scene: "frozen jagged peaks, cutting wind and blowing snow, ice-blue light, only the strong survive" },
  { slug: "eternal-ruins", en: "The Eternal Ruins", scene: "remains of a forgotten ancient kingdom, broken columns and arches, ghostly haze, purple twilight" },
  { slug: "abyss-of-darkness", en: "The Abyss of Darkness", scene: "the deepest chasm in the world, living darkness rising from a bottomless rift, violet void glow" },
];

const monsterBiome = {
  "misty-vale": "misty green valley",
  "shadow-forest": "dark shadowed forest",
  "rot-marshes": "poisonous swamp",
  "fallen-mines": "deep abandoned mine",
  "ash-desert": "scorched ash desert",
  "frost-ridge": "frozen mountain ridge",
  "eternal-ruins": "ancient haunted ruins",
  "abyss-of-darkness": "abyssal void",
};

const monsters = [
  { slug: "grove-rat", en: "a large feral grove rat", loc: "misty-vale", level: 1 },
  { slug: "mist-sprite", en: "an ethereal glowing mist sprite", loc: "misty-vale", level: 3 },
  { slug: "young-boar", en: "a young wild boar", loc: "misty-vale", level: 5 },
  { slug: "shadow-wolf", en: "a black shadow wolf with glowing eyes", loc: "shadow-forest", level: 6 },
  { slug: "creeping-vine", en: "an animated creeping vine creature", loc: "shadow-forest", level: 8 },
  { slug: "forest-lurker", en: "a stealthy forest lurker beast", loc: "shadow-forest", level: 9 },
  { slug: "bog-lurcher", en: "a hulking bog lurcher of mud and weeds", loc: "rot-marshes", level: 10 },
  { slug: "venom-toad", en: "a giant venomous toad", loc: "rot-marshes", level: 12 },
  { slug: "rot-fiend", en: "a rotting swamp fiend", loc: "rot-marshes", level: 14 },
  { slug: "mine-crawler", en: "a chitinous mine crawler insectoid", loc: "fallen-mines", level: 15 },
  { slug: "stone-golem", en: "a massive stone golem", loc: "fallen-mines", level: 18 },
  { slug: "deep-horror", en: "an eldritch deep horror with many eyes", loc: "fallen-mines", level: 20 },
  { slug: "ash-jackal", en: "a lean ash-colored jackal", loc: "ash-desert", level: 21 },
  { slug: "cinder-wraith", en: "a burning cinder wraith of embers", loc: "ash-desert", level: 23 },
  { slug: "sand-colossus", en: "a towering sand and stone colossus", loc: "ash-desert", level: 26 },
  { slug: "frost-wolf", en: "a white frost wolf", loc: "frost-ridge", level: 27 },
  { slug: "ice-revenant", en: "an undead ice revenant", loc: "frost-ridge", level: 30 },
  { slug: "ridge-tyrant", en: "a brutal armored ridge tyrant", loc: "frost-ridge", level: 33 },
  { slug: "ruin-shade", en: "a ghostly ruin shade", loc: "eternal-ruins", level: 34 },
  { slug: "cursed-knight", en: "a cursed undead knight in ancient armor", loc: "eternal-ruins", level: 37 },
  { slug: "throne-guardian", en: "a colossal throne guardian construct", loc: "eternal-ruins", level: 42 },
  { slug: "void-spawn", en: "a writhing void spawn of dark tendrils", loc: "abyss-of-darkness", level: 43 },
  { slug: "dark-devourer", en: "an enormous dark devourer with a gaping maw", loc: "abyss-of-darkness", level: 48 },
  { slug: "the-nameless", en: "The Nameless, a titanic shapeless void god", loc: "abyss-of-darkness", level: 55 },
];

const items = [
  { slug: "rusty-dagger", en: "a plain rusty dagger", type: "WEAPON", rarity: "COMMON" },
  { slug: "hunter-bow", en: "a light wooden hunter's bow", type: "WEAPON", rarity: "COMMON" },
  { slug: "iron-mace", en: "a heavy iron mace", type: "WEAPON", rarity: "UNCOMMON" },
  { slug: "marsh-spear", en: "a poison-tipped marsh spear", type: "WEAPON", rarity: "UNCOMMON" },
  { slug: "miner-pick-blade", en: "a miner's pick sharpened into a blade", type: "WEAPON", rarity: "RARE" },
  { slug: "ash-cleaver", en: "a broad cleaver forged in desert fire", type: "WEAPON", rarity: "RARE" },
  { slug: "frost-glaive", en: "a frozen glaive with an icy blade", type: "WEAPON", rarity: "EPIC" },
  { slug: "ruin-warblade", en: "an ancient knightly warblade", type: "WEAPON", rarity: "EPIC" },
  { slug: "abyssal-reaver", en: "a living abyssal reaver blade whispering in darkness", type: "WEAPON", rarity: "LEGENDARY" },
  { slug: "cracked-buckler", en: "a small cracked wooden buckler", type: "SHIELD", rarity: "COMMON" },
  { slug: "oak-shield", en: "an iron-rimmed oak shield", type: "SHIELD", rarity: "UNCOMMON" },
  { slug: "tower-shield", en: "a large iron tower shield", type: "SHIELD", rarity: "RARE" },
  { slug: "aegis-of-ruin", en: "a ceremonial aegis of a lost army", type: "SHIELD", rarity: "EPIC" },
  { slug: "leather-cap", en: "a simple leather cap", type: "HELMET", rarity: "COMMON" },
  { slug: "iron-helm", en: "a full iron helm with nose guard", type: "HELMET", rarity: "UNCOMMON" },
  { slug: "warden-helm", en: "an ornate warden's helm", type: "HELMET", rarity: "RARE" },
  { slug: "crown-of-frost", en: "a crown of never-melting ice", type: "HELMET", rarity: "EPIC" },
  { slug: "tattered-tunic", en: "a thin tattered cloth tunic", type: "ARMOR", rarity: "COMMON" },
  { slug: "leather-armor", en: "worked leather armor", type: "ARMOR", rarity: "UNCOMMON" },
  { slug: "chain-mail", en: "an iron chain mail hauberk", type: "ARMOR", rarity: "RARE" },
  { slug: "plate-of-ash", en: "blackened scorched plate armor", type: "ARMOR", rarity: "EPIC" },
  { slug: "abyssal-carapace", en: "a living abyssal carapace armor", type: "ARMOR", rarity: "LEGENDARY" },
  { slug: "cloth-pants", en: "plain cloth pants", type: "PANTS", rarity: "COMMON" },
  { slug: "leather-greaves", en: "leather leg greaves", type: "PANTS", rarity: "UNCOMMON" },
  { slug: "iron-greaves", en: "heavy iron leg greaves", type: "PANTS", rarity: "RARE" },
  { slug: "worn-gloves", en: "worn leather gloves", type: "GLOVES", rarity: "COMMON" },
  { slug: "gripping-gauntlets", en: "reinforced gripping gauntlets", type: "GLOVES", rarity: "UNCOMMON" },
  { slug: "frostbite-grips", en: "frost-covered gauntlets", type: "GLOVES", rarity: "RARE" },
  { slug: "cloth-shoes", en: "light soft cloth shoes", type: "BOOTS", rarity: "COMMON" },
  { slug: "traveler-boots", en: "comfortable leather traveler's boots", type: "BOOTS", rarity: "UNCOMMON" },
  { slug: "warplate-boots", en: "armored warplate boots", type: "BOOTS", rarity: "RARE" },
  { slug: "copper-band", en: "a simple copper ring", type: "RING", rarity: "COMMON" },
  { slug: "sage-ring", en: "a ring set with a pale sage stone", type: "RING", rarity: "UNCOMMON" },
  { slug: "viper-ring", en: "a coiled serpent viper ring", type: "RING", rarity: "RARE" },
  { slug: "titan-signet", en: "a heavy titan signet ring radiating power", type: "RING", rarity: "EPIC" },
  { slug: "ring-of-the-void", en: "a dark ring of the void that swallows light", type: "RING", rarity: "LEGENDARY" },
  { slug: "wolf-pelt", en: "a rolled wolf pelt crafting material", type: "MATERIAL", rarity: "COMMON" },
  { slug: "iron-ore", en: "a raw chunk of iron ore", type: "MATERIAL", rarity: "COMMON" },
  { slug: "frost-crystal", en: "a glowing never-melting frost crystal", type: "MATERIAL", rarity: "RARE" },
  { slug: "shadow-essence", en: "condensed dark shadow essence in a vial", type: "MATERIAL", rarity: "EPIC" },
  { slug: "minor-healing-draught", en: "a small red healing potion", type: "CONSUMABLE", rarity: "COMMON" },
  { slug: "greater-healing-draught", en: "a large ornate red healing potion", type: "CONSUMABLE", rarity: "UNCOMMON" },
];

const avatars = [
  { key: "ember", accent: "gold ember", en: "gold-accented" },
  { key: "crimson", accent: "crimson red", en: "crimson-accented" },
  { key: "verdant", accent: "moss green", en: "green-accented" },
  { key: "azure", accent: "azure blue", en: "blue-accented" },
  { key: "violet", accent: "violet purple", en: "purple-accented" },
  { key: "ash", accent: "ashen gray", en: "gray-accented" },
];

const uiScenes = [
  { slug: "town", en: "The Home City", scene: "a medieval fantasy town square hub at dusk, torch-lit stone buildings around a plaza: a blacksmith forge, a market, a tavern, a keep and a gate to the wilds, cobblestones, warm glow" },
  { slug: "keep", en: "The Keep", scene: "the great stone hall of a clan keep, banners, long table, cold blue light through tall windows" },
  { slug: "forge", en: "The Forge", scene: "a medieval blacksmith forge interior, glowing furnace and molten metal, anvils, hanging tools and weapons, warm orange ember light" },
  { slug: "market", en: "The Market", scene: "a bustling medieval fantasy market hall, wooden stalls with wares and weapons, hanging lanterns, warm golden light" },
  { slug: "tavern", en: "The Tavern", scene: "a cozy warm medieval tavern interior, roaring fireplace, wooden tables and benches, barrels and mugs, amber firelight" },
  { slug: "throne", en: "The Throne Hall", scene: "a grand throne hall of a dark kingdom, golden throne on a dais, tall columns, banners, dramatic purple and gold light" },
  { slug: "arena", en: "The Arena", scene: "a grim stone battle arena pit, blood-stained sand, torch sconces, dark spectator stands, ominous red light" },
];

const assets = [];

for (const l of [...locations, ...uiScenes]) {
  assets.push({
    category: "location",
    slug: l.slug,
    path: `art/locations/${l.slug}.png`,
    size: "1600x900",
    prompt: `${l.en}: ${l.scene}. Wide establishing background scene, ${STYLE}`,
  });
}

for (const m of monsters) {
  assets.push({
    category: "monster",
    slug: m.slug,
    path: `art/monsters/${m.slug}.png`,
    size: "768x768",
    prompt: `${m.en}, a level ${m.level} monster in ${monsterBiome[m.loc]}. Single full creature, centered, facing viewer, dark vignette background, ${STYLE}`,
  });
}

for (const it of items) {
  assets.push({
    category: "item",
    slug: it.slug,
    path: `art/items/${it.slug}.png`,
    size: "512x512",
    prompt: `${it.en}, a ${it.rarity.toLowerCase()} ${it.type.toLowerCase()} game inventory item icon, single object centered on a dark stone background, subtle ${it.rarity.toLowerCase()} colored glow, ${STYLE}`,
  });
}

for (const a of avatars) {
  for (const gender of ["male", "female"]) {
    assets.push({
      category: "portrait",
      slug: `${a.key}-${gender}`,
      path: `art/portraits/${a.key}-${gender}.png`,
      size: "768x768",
      prompt: `portrait bust of a ${gender} hooded dark-fantasy adventurer, ${a.en} armor and cloak (${a.accent}), grim determined face partly shadowed by the hood, centered, dark background, ${STYLE}`,
    });
  }
}

const manifest = { style: STYLE, generatedFrom: "seed", count: assets.length, assets };
writeFileSync(join(artDir, "art-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const byCat = (c) => assets.filter((a) => a.category === c);
const table = (rows) =>
  rows
    .map((a) => `| \`${a.slug}\` | ${a.size} | ${a.prompt} |`)
    .join("\n");

const readme = `# Art assets

Every screen in the game renders a **real image** if the matching file exists here, and
falls back to a generated SVG placeholder otherwise (see \`src/components/GameArt.tsx\`).
Drop a PNG at the exact path below and it appears immediately — **no code changes needed**.

## How to fill this in

1. Generate each image with your tool of choice (Midjourney, DALL·E, SDXL, …) using the
   prompt in the tables below (or in \`art-manifest.json\`).
2. Export as **PNG** at roughly the listed size (locations landscape, the rest square).
3. Save it at the listed path (filename = the entity \`slug\`). Done.

Regenerate this file and \`art-manifest.json\` after changing the seed with:

\`\`\`
node apps/web/scripts/gen-art-manifest.mjs
\`\`\`

## Global style

> ${STYLE}

Keep this suffix on every prompt so all art reads as one cohesive set.

## Locations & UI scenes — \`art/locations/<slug>.png\` (1600×900)

| slug | size | prompt |
| --- | --- | --- |
${table(byCat("location"))}

## Monsters — \`art/monsters/<slug>.png\` (768×768)

| slug | size | prompt |
| --- | --- | --- |
${table(byCat("monster"))}

## Items — \`art/items/<slug>.png\` (512×512)

| slug | size | prompt |
| --- | --- | --- |
${table(byCat("item"))}

## Character portraits — \`art/portraits/<key>-<gender>.png\` (768×768)

| slug | size | prompt |
| --- | --- | --- |
${table(byCat("portrait"))}
`;

writeFileSync(join(artDir, "README.md"), readme);

const catTitle = {
  location: "LOCATIONS & SCENES  →  save in  art/locations/  (landscape, ~1600x900)",
  monster: "MONSTERS  →  save in  art/monsters/  (square, ~768x768)",
  item: "ITEMS  →  save in  art/items/  (square, ~512x512)",
  portrait: "CHARACTER PORTRAITS  →  save in  art/portraits/  (square, ~768x768)",
};

const block = (rows) =>
  rows
    .map((a) => `[${a.path}]\n${a.prompt}\n`)
    .join("\n");

const prompts = `DARK AGE — ART PROMPTS (copy-paste)
${"=".repeat(64)}
${assets.length} images. The global style is already baked into every prompt.
For each one: paste the prompt into your image tool, then save the result
using the filename in [brackets] above it. Generated files override the
built-in SVG placeholders automatically — no code changes.

TIP for consistency: generate ONE image first, then reuse it as a
"style reference" (Midjourney --sref, or the "style reference" upload in
Leonardo / ImageFX) for all the rest so the whole set matches.

${Object.keys(catTitle)
  .map(
    (cat) =>
      `\n${"═".repeat(64)}\n  ${catTitle[cat]}\n${"═".repeat(64)}\n\n${block(byCat(cat))}`,
  )
  .join("")}`;

writeFileSync(join(artDir, "prompts.txt"), prompts);
console.log(
  `Wrote ${assets.length} assets to art-manifest.json, README.md, and prompts.txt`,
);
