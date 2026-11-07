// Lance un PostgreSQL local sans Docker (développement uniquement) : npm run local-db
// Données dans .local-db/ (ignoré par git). Arrêt : Ctrl+C.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const port = Number(process.env.LOCAL_DB_PORT ?? 54329);
const dir = ".local-db/data";
const fresh = !existsSync(dir);

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "race",
  password: "race",
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("race");
console.log(`PostgreSQL local prêt : postgresql://race:race@localhost:${port}/race`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
