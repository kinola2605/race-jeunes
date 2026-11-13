-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "matchGoal" INTEGER;

-- CreateTable
CREATE TABLE "MatchGoal" (
    "seasonId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchGoal_pkey" PRIMARY KEY ("seasonId","tagId")
);

-- AddForeignKey
ALTER TABLE "MatchGoal" ADD CONSTRAINT "MatchGoal_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchGoal" ADD CONSTRAINT "MatchGoal_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

