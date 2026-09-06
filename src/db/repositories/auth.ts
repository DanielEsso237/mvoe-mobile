import { getDb } from "@/db/client";
import { nouvelIdentifiant, verifyHash } from "@/db/crypto";
import type { NiveauPortee } from "@/types";

export interface SuperviseurRow {
  id: string;
  nom: string;
  email: string;
  mot_de_passe_hash: string;
  niveau: NiveauPortee;
  entite_id: string | null;
  entite_libelle: string;
}

export interface FacilitateurRow {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  code_appareil_hash: string | null;
  mot_de_passe_hash: string | null;
  type_juridique: string | null;
  organisation_rattachement: string | null;
  arrondissement_id: string;
  arrondissement_nom: string;
  departement_nom: string | null;
  date_formation_initiale: string | null;
  derniere_activite: string | null;
  api_token: string | null;
  created_at: string;
}

export interface ParentProgrammeRow {
  id: string;
  code_parent: string;
  code_acces_hash: string;
  langue: string;
  arrondissement_id: string;
}

export async function trouverSuperviseurParEmail(
  email: string
): Promise<SuperviseurRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SuperviseurRow>(
    "SELECT * FROM superviseurs WHERE email = ?;",
    [email]
  );
  return row ?? null;
}

export async function trouverFacilitateurParTelephone(
  telephone: string
): Promise<FacilitateurRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<FacilitateurRow>(
    "SELECT * FROM facilitateurs WHERE telephone = ?;",
    [telephone]
  );
  return row ?? null;
}

export async function trouverFacilitateurParEmail(
  email: string
): Promise<FacilitateurRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<FacilitateurRow>(
    "SELECT * FROM facilitateurs WHERE email = ?;",
    [email]
  );
  return row ?? null;
}

export async function trouverFacilitateurParId(
  id: string
): Promise<FacilitateurRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<FacilitateurRow>(
    "SELECT * FROM facilitateurs WHERE id = ?;",
    [id]
  );
  return row ?? null;
}

/**
 * Provisionne (ou met à jour) localement un compte facilitateur après un
 * succès de connexion en ligne contre le serveur de référence. Le mot de
 * passe est déjà haché par l'appelant : c'est celui saisi à l'instant, ce
 * qui permet des connexions hors-ligne ultérieures avec les mêmes
 * identifiants, sans jamais transmettre le mot de passe en clair ici.
 * `telephone`, `type_juridique` et `date_formation_initiale` restent
 * inconnus par cette voie (le serveur ne les renvoie pas au login) : la
 * colonne est nullable depuis la migration v3 pour cette raison précise.
 */
export interface ProvisionFacilitateurEnLigne {
  email: string;
  motDePasseHash: string;
  nom: string;
  arrondissementNom: string;
  apiToken: string;
}

export async function provisionnerFacilitateurEnLigne(
  input: ProvisionFacilitateurEnLigne
): Promise<FacilitateurRow> {
  const db = await getDb();
  const existant = await trouverFacilitateurParEmail(input.email);
  const id = existant?.id ?? nouvelIdentifiant("fac");
  const arrondissementId = input.arrondissementNom
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await db.runAsync(
    `INSERT INTO facilitateurs (
       id, nom, email, mot_de_passe_hash, arrondissement_id,
       arrondissement_nom, api_token
     ) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       nom = excluded.nom,
       mot_de_passe_hash = excluded.mot_de_passe_hash,
       arrondissement_nom = excluded.arrondissement_nom,
       api_token = excluded.api_token;`,
    [
      id,
      input.nom,
      input.email,
      input.motDePasseHash,
      arrondissementId,
      input.arrondissementNom,
      input.apiToken,
    ]
  );

  const row = await trouverFacilitateurParEmail(input.email);
  if (!row) throw new Error("Échec du provisionnement local du facilitateur.");
  return row;
}

export async function enregistrerJetonApiFacilitateur(
  id: string,
  jeton: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE facilitateurs SET api_token = ? WHERE id = ?;", [jeton, id]);
}

/**
 * Le jeton du facilitateur actuellement connecté sur cet appareil — un seul
 * kit actif à la fois, voir `getPaquet`. Utilisé par le moteur de
 * synchronisation pour authentifier ses envois vers l'API de référence.
 */
export async function getJetonApiFacilitateurActif(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ api_token: string | null }>(
    `SELECT f.api_token AS api_token
     FROM sessions s
     JOIN facilitateurs f ON f.id = s.account_id
     WHERE s.type = 'facilitateur'
     ORDER BY s.created_at DESC
     LIMIT 1;`
  );
  return row?.api_token ?? null;
}

export async function trouverParentParCode(
  codeParent: string
): Promise<ParentProgrammeRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ParentProgrammeRow>(
    "SELECT * FROM parents_programme WHERE code_parent = ?;",
    [codeParent.trim().toUpperCase()]
  );
  return row ?? null;
}

export async function verifierMotDePasse(
  saisi: string,
  hash: string | null
): Promise<boolean> {
  if (!hash) return false;
  return verifyHash(saisi, hash);
}

export async function creerSession(
  type: "facilitateur" | "superviseur" | "parent",
  accountId: string
): Promise<string> {
  const db = await getDb();
  const token = nouvelIdentifiant(`mock-${type}-token`);
  await db.runAsync(
    "INSERT INTO sessions (token, type, account_id) VALUES (?, ?, ?);",
    [token, type, accountId]
  );
  return token;
}

export async function supprimerSession(token: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM sessions WHERE token = ?;", [token]);
}
