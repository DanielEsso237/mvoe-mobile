import { getDb } from "@/db/client";
import { nouvelIdentifiant } from "@/db/crypto";

export type SyncMethod = "POST" | "PATCH" | "DELETE";
export type SyncStatut = "en_attente" | "synchronise" | "erreur";

export interface SyncQueueRow {
  id: string;
  entity_type: string;
  method: SyncMethod;
  endpoint: string;
  payload: string;
  statut: SyncStatut;
  tentatives: number;
  created_at: string;
  last_error: string | null;
}

/**
 * Dépose une écriture en attente : c'est la seule façon d'écrire des
 * données métier dans cette appli — jamais un appel réseau direct. L'écran
 * appelant peut mettre à jour son état local optimiste immédiatement ; la
 * ligne ici ne sert qu'à rejouer l'envoi vers l'API de référence plus tard.
 */
export async function enqueuer(
  entityType: string,
  method: SyncMethod,
  endpoint: string,
  payload: unknown
): Promise<string> {
  const db = await getDb();
  const id = nouvelIdentifiant("sync");
  await db.runAsync(
    `INSERT INTO sync_queue (id, entity_type, method, endpoint, payload, statut, tentatives)
     VALUES (?, ?, ?, ?, ?, 'en_attente', 0);`,
    [id, entityType, method, endpoint, JSON.stringify(payload)]
  );
  return id;
}

/**
 * Ne rejoue que les lignes réellement en attente : une ligne déjà marquée
 * `erreur` a déjà été rejetée une fois par le serveur pour un motif qui ne
 * changera pas tout seul (format invalide, référence inconnue…) — la
 * rejouer sans arrêt ne ferait que reproduire le même échec à chaque
 * passage, et bloquer le reste du lot avec elle.
 */
export async function listerEnAttente(): Promise<SyncQueueRow[]> {
  const db = await getDb();
  return db.getAllAsync<SyncQueueRow>(
    "SELECT * FROM sync_queue WHERE statut = 'en_attente' ORDER BY created_at ASC;"
  );
}

export async function compterEnAttente(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM sync_queue WHERE statut != 'synchronise';"
  );
  return row?.n ?? 0;
}

export async function marquerSynchronise(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE sync_queue SET statut = 'synchronise' WHERE id = ?;", [
    id,
  ]);
}

export async function marquerErreur(id: string, erreur: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE sync_queue SET statut = 'erreur', tentatives = tentatives + 1, last_error = ? WHERE id = ?;",
    [erreur, id]
  );
}
