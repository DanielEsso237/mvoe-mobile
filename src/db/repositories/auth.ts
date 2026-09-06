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
  telephone: string;
  email: string | null;
  code_appareil_hash: string | null;
  mot_de_passe_hash: string | null;
  type_juridique: string;
  organisation_rattachement: string | null;
  arrondissement_id: string;
  arrondissement_nom: string;
  departement_nom: string;
  date_formation_initiale: string;
  derniere_activite: string | null;
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
