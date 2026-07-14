-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "EquipmentSlot" AS ENUM ('WEAPON', 'SHIELD', 'HELMET', 'ARMOR', 'PANTS', 'GLOVES', 'BOOTS', 'RING_ONE', 'RING_TWO');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'SHIELD', 'HELMET', 'ARMOR', 'PANTS', 'GLOVES', 'BOOTS', 'RING', 'MATERIAL', 'CONSUMABLE');

-- CreateEnum
CREATE TYPE "BattleType" AS ENUM ('PVE', 'PVP');

-- CreateEnum
CREATE TYPE "BattleResult" AS ENUM ('ATTACKER_WIN', 'DEFENDER_WIN', 'DRAW');

-- CreateEnum
CREATE TYPE "ClanRole" AS ENUM ('LEADER', 'OFFICER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProfessionType" AS ENUM ('FISHING', 'FARMING', 'MINING');

-- CreateEnum
CREATE TYPE "ProfessionJobStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "MarketListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('GLOBAL', 'CLAN', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "avatarKey" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 5,
    "wisdom" INTEGER NOT NULL DEFAULT 5,
    "agility" INTEGER NOT NULL DEFAULT 5,
    "endurance" INTEGER NOT NULL DEFAULT 5,
    "level" INTEGER NOT NULL DEFAULT 1,
    "subLevel" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "unspentPoints" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "maxEnergy" INTEGER NOT NULL DEFAULT 100,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "pvpWins" INTEGER NOT NULL DEFAULT 0,
    "pvpLosses" INTEGER NOT NULL DEFAULT 0,
    "pveWins" INTEGER NOT NULL DEFAULT 0,
    "locationId" TEXT NOT NULL,
    "hpUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "energyUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pvpProtectedUntil" TIMESTAMP(3),
    "lastPvpAttackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,
    "energyCost" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monster" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "wisdom" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "endurance" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "weaponBase" INTEGER NOT NULL,
    "armorValue" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "goldMin" INTEGER NOT NULL,
    "goldMax" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "Monster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "levelRequirement" INTEGER NOT NULL DEFAULT 1,
    "strengthBonus" INTEGER NOT NULL DEFAULT 0,
    "wisdomBonus" INTEGER NOT NULL DEFAULT 0,
    "agilityBonus" INTEGER NOT NULL DEFAULT 0,
    "enduranceBonus" INTEGER NOT NULL DEFAULT 0,
    "weaponBase" INTEGER NOT NULL DEFAULT 0,
    "armorValue" INTEGER NOT NULL DEFAULT 0,
    "basePrice" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LootEntry" (
    "id" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "LootEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "equippedSlot" "EquipmentSlot",
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "type" "BattleType" NOT NULL,
    "result" "BattleResult" NOT NULL,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT,
    "monsterId" TEXT,
    "log" JSONB NOT NULL,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "goldGained" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "MarketListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanMember" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" "ClanRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionJob" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "type" "ProfessionType" NOT NULL,
    "status" "ProfessionJobStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishesAt" TIMESTAMP(3) NOT NULL,
    "goldReward" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "clanId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "pvpWins" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_level_xp_idx" ON "Character"("level", "xp");

-- CreateIndex
CREATE INDEX "Character_pvpWins_idx" ON "Character"("pvpWins");

-- CreateIndex
CREATE INDEX "Character_locationId_idx" ON "Character"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_orderIndex_idx" ON "Location"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Monster_slug_key" ON "Monster"("slug");

-- CreateIndex
CREATE INDEX "Monster_locationId_idx" ON "Monster"("locationId");

-- CreateIndex
CREATE INDEX "Monster_level_idx" ON "Monster"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "Item"("type");

-- CreateIndex
CREATE INDEX "Item_rarity_idx" ON "Item"("rarity");

-- CreateIndex
CREATE INDEX "LootEntry_monsterId_idx" ON "LootEntry"("monsterId");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_characterId_equippedSlot_key" ON "InventoryItem"("characterId", "equippedSlot");

-- CreateIndex
CREATE INDEX "Battle_attackerId_idx" ON "Battle"("attackerId");

-- CreateIndex
CREATE INDEX "Battle_defenderId_idx" ON "Battle"("defenderId");

-- CreateIndex
CREATE INDEX "Battle_createdAt_idx" ON "Battle"("createdAt");

-- CreateIndex
CREATE INDEX "MarketListing_status_price_idx" ON "MarketListing"("status", "price");

-- CreateIndex
CREATE INDEX "MarketListing_itemId_idx" ON "MarketListing"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Clan_tag_key" ON "Clan"("tag");

-- CreateIndex
CREATE INDEX "Clan_treasury_idx" ON "Clan"("treasury");

-- CreateIndex
CREATE UNIQUE INDEX "ClanMember_characterId_key" ON "ClanMember"("characterId");

-- CreateIndex
CREATE INDEX "ClanMember_clanId_idx" ON "ClanMember"("clanId");

-- CreateIndex
CREATE INDEX "ProfessionJob_characterId_status_idx" ON "ProfessionJob"("characterId", "status");

-- CreateIndex
CREATE INDEX "ProfessionJob_status_finishesAt_idx" ON "ProfessionJob"("status", "finishesAt");

-- CreateIndex
CREATE INDEX "Message_channel_createdAt_idx" ON "Message"("channel", "createdAt");

-- CreateIndex
CREATE INDEX "Message_recipientId_createdAt_idx" ON "Message"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_clanId_createdAt_idx" ON "Message"("clanId", "createdAt");

-- CreateIndex
CREATE INDEX "RankingSnapshot_capturedAt_rank_idx" ON "RankingSnapshot"("capturedAt", "rank");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monster" ADD CONSTRAINT "Monster_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootEntry" ADD CONSTRAINT "LootEntry_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "Monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootEntry" ADD CONSTRAINT "LootEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionJob" ADD CONSTRAINT "ProfessionJob_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
