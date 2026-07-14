-- CreateTable
CREATE TABLE "CombatSession" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CombatSession_characterId_key" ON "CombatSession"("characterId");

-- CreateIndex
CREATE INDEX "CombatSession_characterId_idx" ON "CombatSession"("characterId");
