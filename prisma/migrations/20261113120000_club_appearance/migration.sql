-- CreateTable
CREATE TABLE "ClubAppearance" (
    "id" TEXT NOT NULL DEFAULT 'club',
    "logo" BYTEA,
    "logoType" TEXT,
    "logoVersion" INTEGER NOT NULL DEFAULT 0,
    "accentDark" TEXT,
    "actionDark" TEXT,
    "accentLight" TEXT,
    "actionLight" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubAppearance_pkey" PRIMARY KEY ("id")
);
