-- spec 016 : installation en un clic
-- Nom et sigle du club saisis à l'installation, modifiables dans Apparence.
ALTER TABLE "ClubAppearance" ADD COLUMN "clubName" TEXT;
ALTER TABLE "ClubAppearance" ADD COLUMN "clubShortName" TEXT;

-- Secrets générés par l'application (clé de session quand SESSION_SECRET n'est pas fourni).
CREATE TABLE "AppSecret" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSecret_pkey" PRIMARY KEY ("id")
);
