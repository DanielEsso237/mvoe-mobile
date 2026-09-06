import { getDb } from "@/db/client";
import { nouvelIdentifiant, verifyHash } from "@/db/crypto";
import { slugify } from "@/db/slug";
import type { NiveauPortee } from "@/types";

export interface SuperviseurRow {
  id: string;
  nom: string;
  email: string;
  mot_de_passe_hash: string;
  niveau: NiveauPortee;
  entite_id: string | null;
  entite_libelle: string;
  api_token: string | null;
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
  const arrondissementId = slugify(input.arrondissementNom);

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
 * Le jeton d'UN facilitateur précis, par son id local. Contrairement à
 * `getJetonApiFacilitateurActif`, ne dépend pas de la session en cours :
 * utile pour un téléchargement déclenché depuis un écran qui connaît déjà
 * `facilitateurId` (via `useAuth()`).
 */
export async function getJetonApiFacilitateur(id: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ api_token: string | null }>(
    "SELECT api_token FROM facilitateurs WHERE id = ?;",
    [id]
  );
  return row?.api_token ?? null;
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

/**
 * Provisionne (ou met à jour) localement un compte superviseur après un
 * succès de connexion en ligne. Contrairement au facilitateur, ce rôle a
 * toujours email+mot de passe : aucune colonne n'a besoin d'être relâchée.
 * `entite_id` est un repère local (dérivé du libellé) puisque le serveur ne
 * renvoie qu'un libellé de portée au login, pas d'identifiant numérique.
 */
export interface ProvisionSuperviseurEnLigne {
  email: string;
  motDePasseHash: string;
  nom: string;
  niveau: NiveauPortee;
  entiteLibelle: string;
  apiToken: string;
}

export async function provisionnerSuperviseurEnLigne(
  input: ProvisionSuperviseurEnLigne
): Promise<SuperviseurRow> {
  const db = await getDb();
  const existant = await trouverSuperviseurParEmail(input.email);
  const id = existant?.id ?? nouvelIdentifiant("sup");
  const entiteId = slugify(input.entiteLibelle);

  await db.runAsync(
    `INSERT INTO superviseurs (id, nom, email, mot_de_passe_hash, niveau, entite_id, entite_libelle, api_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       nom = excluded.nom,
       mot_de_passe_hash = excluded.mot_de_passe_hash,
       niveau = excluded.niveau,
       entite_id = excluded.entite_id,
       entite_libelle = excluded.entite_libelle,
       api_token = excluded.api_token;`,
    [
      id,
      input.nom,
      input.email,
      input.motDePasseHash,
      input.niveau,
      entiteId,
      input.entiteLibelle,
      input.apiToken,
    ]
  );

  const row = await trouverSuperviseurParEmail(input.email);
  if (!row) throw new Error("Échec du provisionnement local du superviseur.");
  return row;
}

export async function getJetonApiSuperviseur(id: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ api_token: string | null }>(
    "SELECT api_token FROM superviseurs WHERE id = ?;",
    [id]
  );
  return row?.api_token ?? null;
}

/**
 * Le jeton du compte actuellement connecté sur cet appareil, facilitateur
 * OU superviseur selon celui des deux qui s'est connecté en dernier — un
 * seul rôle actif à la fois. Utilisé par le moteur de synchronisation pour
 * les écritures génériques (`traiterUnParUn`), qui ne savent pas d'avance
 * de quel espace elles viennent.
 */
export async function getJetonApiActif(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ api_token: string | null }>(
    `SELECT api_token FROM (
       SELECT f.api_token AS api_token, s.created_at AS created_at
       FROM sessions s JOIN facilitateurs f ON f.id = s.account_id
       WHERE s.type = 'facilitateur'
       UNION ALL
       SELECT sv.api_token AS api_token, s.created_at AS created_at
       FROM sessions s JOIN superviseurs sv ON sv.id = s.account_id
       WHERE s.type = 'superviseur'
     )
     ORDER BY created_at DESC
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
