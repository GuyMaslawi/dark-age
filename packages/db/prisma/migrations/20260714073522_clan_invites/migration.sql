-- CreateTable
CREATE TABLE "ClanInvite" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClanInvite_characterId_idx" ON "ClanInvite"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanInvite_clanId_characterId_key" ON "ClanInvite"("clanId", "characterId");

-- AddForeignKey
ALTER TABLE "ClanInvite" ADD CONSTRAINT "ClanInvite_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanInvite" ADD CONSTRAINT "ClanInvite_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
