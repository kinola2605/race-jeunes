// Vide la base LOCALE de développement (.local-db) — jamais en production.
import { PrismaClient } from "@prisma/client";
const url = process.env.DATABASE_URL ?? "";
if (!url.includes("localhost:54329")) { console.error("Refusé : uniquement pour la base locale embarquée."); process.exit(1); }
const db = new PrismaClient();
await db.$executeRawUnsafe('TRUNCATE "PointsEntry","Match","Enrollment","ScoringRuleSet","RecalcRun","Season","UserTag","Tag","RankingChange","Session","LoginThrottle","AuditLog","User","ClubAppearance","AppSecret" CASCADE');
await db.$disconnect();
console.log("Base locale vidée.");
