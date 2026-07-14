import {
  PrismaClient,
  ItemType,
  Rarity,
  type Prisma,
} from "@prisma/client";

const prisma = new PrismaClient();

type LocationSeed = {
  slug: string;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  energyCost: number;
  orderIndex: number;
};

type MonsterSeed = {
  slug: string;
  name: string;
  locationSlug: string;
  level: number;
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  maxHp: number;
  weaponBase: number;
  armorValue: number;
  xpReward: number;
  goldMin: number;
  goldMax: number;
  loot: Array<{ itemSlug: string; weight: number }>;
};

type ItemSeed = {
  slug: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  levelRequirement: number;
  strengthBonus?: number;
  wisdomBonus?: number;
  agilityBonus?: number;
  enduranceBonus?: number;
  weaponBase?: number;
  armorValue?: number;
  basePrice: number;
};

const locations: LocationSeed[] = [
  {
    slug: "misty-vale",
    name: "עמק הערפילים",
    description: "עמק ירקרק עטוף אֵד קבוע, שער היוצאים אל העולם. יצורים חלשים משוטטים בין העצים.",
    minLevel: 1,
    maxLevel: 5,
    energyCost: 4,
    orderIndex: 1,
  },
  {
    slug: "shadow-forest",
    name: "יער הצללים",
    description: "יער עבות שאור השמש כמעט אינו חודר בו. עיניים נוצצות בין הגזעים.",
    minLevel: 4,
    maxLevel: 9,
    energyCost: 6,
    orderIndex: 2,
  },
  {
    slug: "rot-marshes",
    name: "ביצות הרקב",
    description: "אדמה טובענית ומצחינה, מקום מושבם של יצורי ביצה ארסיים.",
    minLevel: 8,
    maxLevel: 14,
    energyCost: 8,
    orderIndex: 3,
  },
  {
    slug: "fallen-mines",
    name: "מכרות הנפל",
    description: "מכרות נטושים שנחפרו עמוק מדי. משהו התעורר במעמקים.",
    minLevel: 13,
    maxLevel: 20,
    energyCost: 10,
    orderIndex: 4,
  },
  {
    slug: "ash-desert",
    name: "מדבר האפר",
    description: "מרחב שרוף עד האופק, אפר חם נישא ברוח מעל עצמות מלבינות.",
    minLevel: 18,
    maxLevel: 26,
    energyCost: 12,
    orderIndex: 5,
  },
  {
    slug: "frost-ridge",
    name: "רכס הכפור",
    description: "פסגות קפואות שהרוח בהן חותכת כלהב. כאן שורדים רק החזקים.",
    minLevel: 24,
    maxLevel: 33,
    energyCost: 14,
    orderIndex: 6,
  },
  {
    slug: "eternal-ruins",
    name: "חורבות עד",
    description: "שרידי ממלכה קדומה שנשכחה. רוחות רפאים שומרות על סודותיה.",
    minLevel: 31,
    maxLevel: 42,
    energyCost: 16,
    orderIndex: 7,
  },
  {
    slug: "abyss-of-darkness",
    name: "תהום האופל",
    description: "הסדק העמוק ביותר בעולם, ממנו עולה חושך חי. סוף הדרך לאמיצים בלבד.",
    minLevel: 40,
    maxLevel: 55,
    energyCost: 20,
    orderIndex: 8,
  },
];

const items: ItemSeed[] = [
  { slug: "rusty-dagger", name: "פגיון חלוד", description: "להב פשוט שראה ימים טובים יותר.", type: ItemType.WEAPON, rarity: Rarity.COMMON, levelRequirement: 1, weaponBase: 4, strengthBonus: 1, basePrice: 25 },
  { slug: "hunter-bow", name: "קשת הצייד", description: "קשת עץ קלה, מדויקת בידיים נכונות.", type: ItemType.WEAPON, rarity: Rarity.COMMON, levelRequirement: 3, weaponBase: 6, agilityBonus: 2, basePrice: 60 },
  { slug: "iron-mace", name: "אלת ברזל", description: "מוט ברזל כבד שמוחץ שריון.", type: ItemType.WEAPON, rarity: Rarity.UNCOMMON, levelRequirement: 6, weaponBase: 11, strengthBonus: 3, basePrice: 140 },
  { slug: "marsh-spear", name: "כידון הביצה", description: "כידון מורעל בעדינות בארס ביצות.", type: ItemType.WEAPON, rarity: Rarity.UNCOMMON, levelRequirement: 9, weaponBase: 15, wisdomBonus: 3, basePrice: 240 },
  { slug: "miner-pick-blade", name: "מכוש הכורים", description: "מכוש שחודד ללהב קטלני.", type: ItemType.WEAPON, rarity: Rarity.RARE, levelRequirement: 14, weaponBase: 22, strengthBonus: 5, enduranceBonus: 2, basePrice: 520 },
  { slug: "ash-cleaver", name: "מבתר האפר", description: "חרב רחבה שנחשלה באש המדבר.", type: ItemType.WEAPON, rarity: Rarity.RARE, levelRequirement: 19, weaponBase: 29, strengthBonus: 6, agilityBonus: 3, basePrice: 880 },
  { slug: "frost-glaive", name: "רומח הכפור", description: "להבו הקפוא מקהה את חושי היריב.", type: ItemType.WEAPON, rarity: Rarity.EPIC, levelRequirement: 25, weaponBase: 38, wisdomBonus: 6, agilityBonus: 5, basePrice: 1700 },
  { slug: "ruin-warblade", name: "להב החורבות", description: "חרב אבירים עתיקה, עדיין חדה כביום שנפלה.", type: ItemType.WEAPON, rarity: Rarity.EPIC, levelRequirement: 32, weaponBase: 47, strengthBonus: 9, enduranceBonus: 4, basePrice: 2900 },
  { slug: "abyssal-reaver", name: "קוצר התהום", description: "להב חי שלוחש בחשכה ומשל מי שאוחז בו.", type: ItemType.WEAPON, rarity: Rarity.LEGENDARY, levelRequirement: 42, weaponBase: 64, strengthBonus: 12, wisdomBonus: 8, agilityBonus: 6, basePrice: 6800 },

  { slug: "cracked-buckler", name: "תריס סדוק", description: "מגן עץ קטן שעוד מחזיק מעמד.", type: ItemType.SHIELD, rarity: Rarity.COMMON, levelRequirement: 1, armorValue: 3, enduranceBonus: 1, basePrice: 20 },
  { slug: "oak-shield", name: "מגן האלון", description: "מגן עץ אלון מחוזק שוליים בברזל.", type: ItemType.SHIELD, rarity: Rarity.UNCOMMON, levelRequirement: 7, armorValue: 7, enduranceBonus: 3, basePrice: 160 },
  { slug: "tower-shield", name: "מגן המגדל", description: "מגן ברזל גדול שמסתיר את כל הגוף.", type: ItemType.SHIELD, rarity: Rarity.RARE, levelRequirement: 16, armorValue: 13, enduranceBonus: 5, basePrice: 620 },
  { slug: "aegis-of-ruin", name: "מגן החורבות", description: "מגן טקסי שנשא צבא שנכחד.", type: ItemType.SHIELD, rarity: Rarity.EPIC, levelRequirement: 30, armorValue: 21, enduranceBonus: 8, strengthBonus: 3, basePrice: 2400 },

  { slug: "leather-cap", name: "כובע עור", description: "כובע עור פשוט להגנה בסיסית.", type: ItemType.HELMET, rarity: Rarity.COMMON, levelRequirement: 2, armorValue: 2, agilityBonus: 1, basePrice: 30 },
  { slug: "iron-helm", name: "קסדת ברזל", description: "קסדת ברזל מלאה עם מגן אף.", type: ItemType.HELMET, rarity: Rarity.UNCOMMON, levelRequirement: 8, armorValue: 5, enduranceBonus: 2, basePrice: 170 },
  { slug: "warden-helm", name: "קסדת השומרים", description: "קסדה מעוטרת של שומרי החורבות.", type: ItemType.HELMET, rarity: Rarity.RARE, levelRequirement: 18, armorValue: 9, enduranceBonus: 3, wisdomBonus: 3, basePrice: 700 },
  { slug: "crown-of-frost", name: "כתר הכפור", description: "כתר קרח שאינו נמס לעולם.", type: ItemType.HELMET, rarity: Rarity.EPIC, levelRequirement: 28, armorValue: 14, wisdomBonus: 7, agilityBonus: 3, basePrice: 2100 },

  { slug: "tattered-tunic", name: "כותונת בלויה", description: "בגד בד דק, טוב מכלום.", type: ItemType.ARMOR, rarity: Rarity.COMMON, levelRequirement: 1, armorValue: 3, basePrice: 25 },
  { slug: "leather-armor", name: "שריון עור", description: "שריון עור מעובד שמאזן הגנה וניידות.", type: ItemType.ARMOR, rarity: Rarity.UNCOMMON, levelRequirement: 6, armorValue: 8, agilityBonus: 2, basePrice: 190 },
  { slug: "chain-mail", name: "שריון קשקשים", description: "טבעות ברזל שזורות להגנה מלאה.", type: ItemType.ARMOR, rarity: Rarity.RARE, levelRequirement: 15, armorValue: 16, enduranceBonus: 4, basePrice: 740 },
  { slug: "plate-of-ash", name: "שריון האפר", description: "שריון לוחות שנצרב עד שהשחיר.", type: ItemType.ARMOR, rarity: Rarity.EPIC, levelRequirement: 26, armorValue: 26, enduranceBonus: 7, strengthBonus: 4, basePrice: 2600 },
  { slug: "abyssal-carapace", name: "שריון התהום", description: "קליפה חיה שצומחת עם נושאה.", type: ItemType.ARMOR, rarity: Rarity.LEGENDARY, levelRequirement: 44, armorValue: 40, enduranceBonus: 12, strengthBonus: 6, basePrice: 7200 },

  { slug: "cloth-pants", name: "מכנסי בד", description: "מכנסי בד רגילים.", type: ItemType.PANTS, rarity: Rarity.COMMON, levelRequirement: 1, armorValue: 2, basePrice: 18 },
  { slug: "leather-greaves", name: "מגני עור לרגליים", description: "הגנת עור לירכיים ולשוקיים.", type: ItemType.PANTS, rarity: Rarity.UNCOMMON, levelRequirement: 7, armorValue: 6, agilityBonus: 2, basePrice: 150 },
  { slug: "iron-greaves", name: "מגני ברזל לרגליים", description: "לוחות ברזל כבדים לרגליים.", type: ItemType.PANTS, rarity: Rarity.RARE, levelRequirement: 17, armorValue: 12, enduranceBonus: 4, basePrice: 640 },

  { slug: "worn-gloves", name: "כפפות בלויות", description: "כפפות עור שחוקות.", type: ItemType.GLOVES, rarity: Rarity.COMMON, levelRequirement: 2, armorValue: 1, agilityBonus: 1, basePrice: 20 },
  { slug: "gripping-gauntlets", name: "כפפות אחיזה", description: "כפפות מחוזקות שמשפרות את האחיזה בנשק.", type: ItemType.GLOVES, rarity: Rarity.UNCOMMON, levelRequirement: 9, armorValue: 4, strengthBonus: 2, basePrice: 160 },
  { slug: "frostbite-grips", name: "כפפות הכפור", description: "מגען קופא, מכה מסמרת.", type: ItemType.GLOVES, rarity: Rarity.RARE, levelRequirement: 22, armorValue: 8, agilityBonus: 4, wisdomBonus: 2, basePrice: 780 },

  { slug: "cloth-shoes", name: "נעלי בד", description: "נעליים קלות ורכות.", type: ItemType.BOOTS, rarity: Rarity.COMMON, levelRequirement: 1, armorValue: 1, agilityBonus: 1, basePrice: 18 },
  { slug: "traveler-boots", name: "מגפי הנודד", description: "מגפי עור נוחים לדרך ארוכה.", type: ItemType.BOOTS, rarity: Rarity.UNCOMMON, levelRequirement: 8, armorValue: 4, agilityBonus: 3, basePrice: 170 },
  { slug: "warplate-boots", name: "מגפי קרב", description: "מגפי לוחות שאינם נרתעים מדבר.", type: ItemType.BOOTS, rarity: Rarity.RARE, levelRequirement: 20, armorValue: 9, enduranceBonus: 3, agilityBonus: 2, basePrice: 700 },

  { slug: "copper-band", name: "טבעת נחושת", description: "טבעת פשוטה עם ברק חיוור.", type: ItemType.RING, rarity: Rarity.COMMON, levelRequirement: 3, strengthBonus: 1, basePrice: 40 },
  { slug: "sage-ring", name: "טבעת החכם", description: "טבעת ששוקעה בה אבן בהירה, מחדדת את החושים.", type: ItemType.RING, rarity: Rarity.UNCOMMON, levelRequirement: 10, wisdomBonus: 3, basePrice: 220 },
  { slug: "viper-ring", name: "טבעת הצפע", description: "טבעת נחש שמזרזת את התגובה.", type: ItemType.RING, rarity: Rarity.RARE, levelRequirement: 21, agilityBonus: 4, wisdomBonus: 2, basePrice: 820 },
  { slug: "titan-signet", name: "חותם הטיטאן", description: "טבעת כבדה ששופעת עוצמה גולמית.", type: ItemType.RING, rarity: Rarity.EPIC, levelRequirement: 33, strengthBonus: 7, enduranceBonus: 4, basePrice: 2700 },
  { slug: "ring-of-the-void", name: "טבעת הריק", description: "עיגול חשוך שבולע אור ומעניק כוח.", type: ItemType.RING, rarity: Rarity.LEGENDARY, levelRequirement: 45, strengthBonus: 6, wisdomBonus: 6, agilityBonus: 6, enduranceBonus: 6, basePrice: 8000 },

  { slug: "wolf-pelt", name: "פרוות זאב", description: "חומר גלם נחשק אצל אומני עור.", type: ItemType.MATERIAL, rarity: Rarity.COMMON, levelRequirement: 1, basePrice: 15 },
  { slug: "iron-ore", name: "עפרת ברזל", description: "גוש ברזל גולמי מהמכרות.", type: ItemType.MATERIAL, rarity: Rarity.COMMON, levelRequirement: 1, basePrice: 22 },
  { slug: "frost-crystal", name: "גביש כפור", description: "גביש קר שאינו נמס, חומר יקר.", type: ItemType.MATERIAL, rarity: Rarity.RARE, levelRequirement: 1, basePrice: 120 },
  { slug: "shadow-essence", name: "תמצית צל", description: "אֵד חשוך מעובה, מרכיב בנדיר שברוקחים.", type: ItemType.MATERIAL, rarity: Rarity.EPIC, levelRequirement: 1, basePrice: 400 },

  { slug: "minor-healing-draught", name: "שיקוי ריפוי קטן", description: "משיב מעט בריאות בעת צרה.", type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, levelRequirement: 1, basePrice: 35 },
  { slug: "greater-healing-draught", name: "שיקוי ריפוי גדול", description: "משיב בריאות רבה בבת אחת.", type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, levelRequirement: 10, basePrice: 120 },
];

const monsters: MonsterSeed[] = [
  { slug: "grove-rat", name: "חולדת החורש", locationSlug: "misty-vale", level: 1, strength: 3, wisdom: 3, agility: 4, endurance: 2, maxHp: 40, weaponBase: 3, armorValue: 1, xpReward: 12, goldMin: 3, goldMax: 8, loot: [{ itemSlug: "wolf-pelt", weight: 60 }, { itemSlug: "rusty-dagger", weight: 15 }, { itemSlug: "minor-healing-draught", weight: 10 }] },
  { slug: "mist-sprite", name: "רוח הערפל", locationSlug: "misty-vale", level: 3, strength: 3, wisdom: 6, agility: 6, endurance: 3, maxHp: 55, weaponBase: 5, armorValue: 2, xpReward: 20, goldMin: 5, goldMax: 12, loot: [{ itemSlug: "cloth-shoes", weight: 30 }, { itemSlug: "copper-band", weight: 15 }, { itemSlug: "minor-healing-draught", weight: 20 }] },
  { slug: "young-boar", name: "חזיר בר צעיר", locationSlug: "misty-vale", level: 5, strength: 7, wisdom: 2, agility: 3, endurance: 6, maxHp: 80, weaponBase: 7, armorValue: 3, xpReward: 30, goldMin: 8, goldMax: 18, loot: [{ itemSlug: "wolf-pelt", weight: 50 }, { itemSlug: "leather-cap", weight: 20 }, { itemSlug: "hunter-bow", weight: 8 }] },

  { slug: "shadow-wolf", name: "זאב הצללים", locationSlug: "shadow-forest", level: 6, strength: 8, wisdom: 4, agility: 8, endurance: 5, maxHp: 95, weaponBase: 9, armorValue: 4, xpReward: 42, goldMin: 10, goldMax: 24, loot: [{ itemSlug: "wolf-pelt", weight: 55 }, { itemSlug: "leather-armor", weight: 15 }, { itemSlug: "iron-mace", weight: 8 }] },
  { slug: "creeping-vine", name: "גזע זוחל", locationSlug: "shadow-forest", level: 8, strength: 9, wisdom: 5, agility: 3, endurance: 9, maxHp: 130, weaponBase: 10, armorValue: 7, xpReward: 55, goldMin: 12, goldMax: 28, loot: [{ itemSlug: "oak-shield", weight: 18 }, { itemSlug: "leather-greaves", weight: 15 }, { itemSlug: "greater-healing-draught", weight: 6 }] },
  { slug: "forest-lurker", name: "אורב היער", locationSlug: "shadow-forest", level: 9, strength: 10, wisdom: 8, agility: 9, endurance: 6, maxHp: 120, weaponBase: 12, armorValue: 5, xpReward: 64, goldMin: 15, goldMax: 32, loot: [{ itemSlug: "iron-helm", weight: 14 }, { itemSlug: "traveler-boots", weight: 14 }, { itemSlug: "sage-ring", weight: 7 }] },

  { slug: "bog-lurcher", name: "טובעני הביצה", locationSlug: "rot-marshes", level: 10, strength: 11, wisdom: 6, agility: 5, endurance: 10, maxHp: 160, weaponBase: 13, armorValue: 8, xpReward: 78, goldMin: 18, goldMax: 40, loot: [{ itemSlug: "marsh-spear", weight: 10 }, { itemSlug: "gripping-gauntlets", weight: 15 }, { itemSlug: "iron-ore", weight: 30 }] },
  { slug: "venom-toad", name: "קרפדת הארס", locationSlug: "rot-marshes", level: 12, strength: 9, wisdom: 11, agility: 10, endurance: 8, maxHp: 150, weaponBase: 15, armorValue: 6, xpReward: 90, goldMin: 20, goldMax: 44, loot: [{ itemSlug: "sage-ring", weight: 12 }, { itemSlug: "greater-healing-draught", weight: 12 }, { itemSlug: "marsh-spear", weight: 8 }] },
  { slug: "rot-fiend", name: "שד הרקב", locationSlug: "rot-marshes", level: 14, strength: 14, wisdom: 9, agility: 8, endurance: 12, maxHp: 200, weaponBase: 17, armorValue: 10, xpReward: 110, goldMin: 26, goldMax: 55, loot: [{ itemSlug: "chain-mail", weight: 9 }, { itemSlug: "iron-greaves", weight: 10 }, { itemSlug: "miner-pick-blade", weight: 5 }] },

  { slug: "mine-crawler", name: "זוחל המכרות", locationSlug: "fallen-mines", level: 15, strength: 14, wisdom: 7, agility: 9, endurance: 13, maxHp: 220, weaponBase: 18, armorValue: 12, xpReward: 128, goldMin: 30, goldMax: 62, loot: [{ itemSlug: "iron-ore", weight: 40 }, { itemSlug: "tower-shield", weight: 8 }, { itemSlug: "miner-pick-blade", weight: 7 }] },
  { slug: "stone-golem", name: "גולם אבן", locationSlug: "fallen-mines", level: 18, strength: 18, wisdom: 5, agility: 4, endurance: 18, maxHp: 320, weaponBase: 22, armorValue: 16, xpReward: 165, goldMin: 40, goldMax: 80, loot: [{ itemSlug: "warden-helm", weight: 10 }, { itemSlug: "chain-mail", weight: 8 }, { itemSlug: "iron-ore", weight: 30 }] },
  { slug: "deep-horror", name: "אימת המעמקים", locationSlug: "fallen-mines", level: 20, strength: 17, wisdom: 14, agility: 12, endurance: 14, maxHp: 300, weaponBase: 24, armorValue: 13, xpReward: 195, goldMin: 48, goldMax: 92, loot: [{ itemSlug: "warplate-boots", weight: 10 }, { itemSlug: "ash-cleaver", weight: 5 }, { itemSlug: "shadow-essence", weight: 3 }] },

  { slug: "ash-jackal", name: "תן האפר", locationSlug: "ash-desert", level: 21, strength: 18, wisdom: 10, agility: 15, endurance: 12, maxHp: 300, weaponBase: 25, armorValue: 12, xpReward: 215, goldMin: 52, goldMax: 100, loot: [{ itemSlug: "viper-ring", weight: 10 }, { itemSlug: "ash-cleaver", weight: 7 }, { itemSlug: "frostbite-grips", weight: 6 }] },
  { slug: "cinder-wraith", name: "רוח הגחלים", locationSlug: "ash-desert", level: 23, strength: 15, wisdom: 18, agility: 16, endurance: 11, maxHp: 290, weaponBase: 27, armorValue: 10, xpReward: 245, goldMin: 58, goldMax: 110, loot: [{ itemSlug: "shadow-essence", weight: 6 }, { itemSlug: "crown-of-frost", weight: 4 }, { itemSlug: "greater-healing-draught", weight: 14 }] },
  { slug: "sand-colossus", name: "ענק החולות", locationSlug: "ash-desert", level: 26, strength: 24, wisdom: 8, agility: 7, endurance: 22, maxHp: 460, weaponBase: 31, armorValue: 20, xpReward: 300, goldMin: 70, goldMax: 135, loot: [{ itemSlug: "plate-of-ash", weight: 7 }, { itemSlug: "titan-signet", weight: 4 }, { itemSlug: "aegis-of-ruin", weight: 3 }] },

  { slug: "frost-wolf", name: "זאב הכפור", locationSlug: "frost-ridge", level: 27, strength: 22, wisdom: 12, agility: 18, endurance: 16, maxHp: 400, weaponBase: 32, armorValue: 16, xpReward: 330, goldMin: 76, goldMax: 145, loot: [{ itemSlug: "frost-crystal", weight: 25 }, { itemSlug: "frostbite-grips", weight: 10 }, { itemSlug: "frost-glaive", weight: 5 }] },
  { slug: "ice-revenant", name: "מת הקרח", locationSlug: "frost-ridge", level: 30, strength: 21, wisdom: 20, agility: 15, endurance: 18, maxHp: 440, weaponBase: 35, armorValue: 18, xpReward: 380, goldMin: 88, goldMax: 165, loot: [{ itemSlug: "crown-of-frost", weight: 7 }, { itemSlug: "frost-glaive", weight: 6 }, { itemSlug: "frost-crystal", weight: 20 }] },
  { slug: "ridge-tyrant", name: "עריץ הרכס", locationSlug: "frost-ridge", level: 33, strength: 28, wisdom: 16, agility: 14, endurance: 24, maxHp: 560, weaponBase: 40, armorValue: 24, xpReward: 450, goldMin: 105, goldMax: 195, loot: [{ itemSlug: "aegis-of-ruin", weight: 6 }, { itemSlug: "titan-signet", weight: 5 }, { itemSlug: "ruin-warblade", weight: 3 }] },

  { slug: "ruin-shade", name: "צל החורבות", locationSlug: "eternal-ruins", level: 34, strength: 24, wisdom: 22, agility: 20, endurance: 18, maxHp: 500, weaponBase: 41, armorValue: 18, xpReward: 490, goldMin: 110, goldMax: 210, loot: [{ itemSlug: "shadow-essence", weight: 10 }, { itemSlug: "ruin-warblade", weight: 5 }, { itemSlug: "warden-helm", weight: 8 }] },
  { slug: "cursed-knight", name: "אביר מקולל", locationSlug: "eternal-ruins", level: 37, strength: 30, wisdom: 18, agility: 17, endurance: 26, maxHp: 640, weaponBase: 45, armorValue: 26, xpReward: 560, goldMin: 125, goldMax: 235, loot: [{ itemSlug: "ruin-warblade", weight: 7 }, { itemSlug: "aegis-of-ruin", weight: 6 }, { itemSlug: "plate-of-ash", weight: 8 }] },
  { slug: "throne-guardian", name: "שומר כס המלכות", locationSlug: "eternal-ruins", level: 42, strength: 34, wisdom: 24, agility: 18, endurance: 30, maxHp: 800, weaponBase: 52, armorValue: 30, xpReward: 700, goldMin: 160, goldMax: 300, loot: [{ itemSlug: "abyssal-reaver", weight: 3 }, { itemSlug: "titan-signet", weight: 8 }, { itemSlug: "shadow-essence", weight: 12 }] },

  { slug: "void-spawn", name: "נבט הריק", locationSlug: "abyss-of-darkness", level: 43, strength: 32, wisdom: 26, agility: 24, endurance: 24, maxHp: 720, weaponBase: 53, armorValue: 24, xpReward: 760, goldMin: 170, goldMax: 320, loot: [{ itemSlug: "abyssal-reaver", weight: 4 }, { itemSlug: "abyssal-carapace", weight: 3 }, { itemSlug: "ring-of-the-void", weight: 2 }] },
  { slug: "dark-devourer", name: "זולל האופל", locationSlug: "abyss-of-darkness", level: 48, strength: 40, wisdom: 28, agility: 22, endurance: 32, maxHp: 950, weaponBase: 60, armorValue: 30, xpReward: 920, goldMin: 210, goldMax: 400, loot: [{ itemSlug: "abyssal-carapace", weight: 5 }, { itemSlug: "ring-of-the-void", weight: 3 }, { itemSlug: "abyssal-reaver", weight: 5 }] },
  { slug: "the-nameless", name: "חסר השם", locationSlug: "abyss-of-darkness", level: 55, strength: 48, wisdom: 36, agility: 28, endurance: 40, maxHp: 1400, weaponBase: 72, armorValue: 38, xpReward: 1300, goldMin: 320, goldMax: 600, loot: [{ itemSlug: "ring-of-the-void", weight: 6 }, { itemSlug: "abyssal-reaver", weight: 8 }, { itemSlug: "abyssal-carapace", weight: 8 }] },
];

async function main(): Promise<void> {
  for (const location of locations) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: location,
      create: location,
    });
  }

  for (const item of items) {
    const data: Prisma.ItemCreateInput = {
      slug: item.slug,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      levelRequirement: item.levelRequirement,
      strengthBonus: item.strengthBonus ?? 0,
      wisdomBonus: item.wisdomBonus ?? 0,
      agilityBonus: item.agilityBonus ?? 0,
      enduranceBonus: item.enduranceBonus ?? 0,
      weaponBase: item.weaponBase ?? 0,
      armorValue: item.armorValue ?? 0,
      basePrice: item.basePrice,
    };
    await prisma.item.upsert({
      where: { slug: item.slug },
      update: data,
      create: data,
    });
  }

  for (const monster of monsters) {
    const location = await prisma.location.findUniqueOrThrow({
      where: { slug: monster.locationSlug },
    });
    const saved = await prisma.monster.upsert({
      where: { slug: monster.slug },
      update: {
        name: monster.name,
        locationId: location.id,
        level: monster.level,
        strength: monster.strength,
        wisdom: monster.wisdom,
        agility: monster.agility,
        endurance: monster.endurance,
        maxHp: monster.maxHp,
        weaponBase: monster.weaponBase,
        armorValue: monster.armorValue,
        xpReward: monster.xpReward,
        goldMin: monster.goldMin,
        goldMax: monster.goldMax,
      },
      create: {
        slug: monster.slug,
        name: monster.name,
        locationId: location.id,
        level: monster.level,
        strength: monster.strength,
        wisdom: monster.wisdom,
        agility: monster.agility,
        endurance: monster.endurance,
        maxHp: monster.maxHp,
        weaponBase: monster.weaponBase,
        armorValue: monster.armorValue,
        xpReward: monster.xpReward,
        goldMin: monster.goldMin,
        goldMax: monster.goldMax,
      },
    });

    await prisma.lootEntry.deleteMany({ where: { monsterId: saved.id } });
    for (const entry of monster.loot) {
      const item = await prisma.item.findUniqueOrThrow({
        where: { slug: entry.itemSlug },
      });
      await prisma.lootEntry.create({
        data: { monsterId: saved.id, itemId: item.id, weight: entry.weight },
      });
    }
  }

  const locationCount = await prisma.location.count();
  const monsterCount = await prisma.monster.count();
  const itemCount = await prisma.item.count();
  console.log(
    `Seed complete: ${locationCount} locations, ${monsterCount} monsters, ${itemCount} items`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
