import * as SQLite from "expo-sqlite";

import { MIGRATIONS, SCHEMA_VERSION } from "./schema";
import { seedDefaults } from "./seed";

const DATABASE_NAME = "mvoe.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL;");

  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  let version = row?.user_version ?? 0;

  while (version < SCHEMA_VERSION) {
    const migration = MIGRATIONS[version];
    await db.execAsync(migration);
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version};`);
  }

  await seedDefaults(db);

  return db;
}

/**
 * Une seule connexion partagée par toute l'app, ouverte et migrée une seule
 * fois même si plusieurs écrans l'appellent en parallèle au démarrage.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}
