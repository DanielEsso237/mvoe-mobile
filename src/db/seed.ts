import type { SQLiteDatabase } from "expo-sqlite";

import { hashText } from "./crypto";

/**
 * Identifiants de démonstration, insérés une seule fois à la création de la
 * base locale. Ce sont les mêmes que ceux déjà annoncés à l'utilisateur :
 * seule leur source change (SQLite plutôt qu'une constante JS en mémoire).
 */
export const DEMO_CREDENTIALS = {
  facilitateurTelephone: "699112233",
  facilitateurCodeAppareil: "123456",
  facilitateurEmail: "marie.ateba@minproff.cm",
  facilitateurMotDePasse: "demo1234",
  superviseurEmail: "paul.nkolo@minproff.cm",
  superviseurMotDePasse: "demo1234",
  superviseurNationalEmail: "direction@minproff.cm",
  superviseurNationalMotDePasse: "demo1234",
  parentCodeParent: "EB2-01",
  parentCodeAcces: "1234",
} as const;

export async function seedDefaults(db: SQLiteDatabase): Promise<void> {
  const superviseurCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM superviseurs;"
  );
  if ((superviseurCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO superviseurs (id, nom, email, mot_de_passe_hash, niveau, entite_id, entite_libelle)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "sup-1",
        "Nkolo Paul",
        DEMO_CREDENTIALS.superviseurEmail,
        await hashText(DEMO_CREDENTIALS.superviseurMotDePasse),
        "arrondissement",
        "ebolowa-2",
        "Ebolowa II",
      ]
    );
    await db.runAsync(
      `INSERT INTO superviseurs (id, nom, email, mot_de_passe_hash, niveau, entite_id, entite_libelle)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "sup-national-1",
        "Direction MINPROFF",
        DEMO_CREDENTIALS.superviseurNationalEmail,
        await hashText(DEMO_CREDENTIALS.superviseurNationalMotDePasse),
        "national",
        null,
        "Cameroun",
      ]
    );
  }

  const facilitateurCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM facilitateurs;"
  );
  if ((facilitateurCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO facilitateurs
        (id, nom, telephone, email, code_appareil_hash, mot_de_passe_hash,
         type_juridique, organisation_rattachement, arrondissement_id,
         arrondissement_nom, departement_nom, date_formation_initiale, derniere_activite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "fac-1",
        "Ateba Marie-Claire",
        DEMO_CREDENTIALS.facilitateurTelephone,
        DEMO_CREDENTIALS.facilitateurEmail,
        await hashText(DEMO_CREDENTIALS.facilitateurCodeAppareil),
        await hashText(DEMO_CREDENTIALS.facilitateurMotDePasse),
        "association",
        "Association Femmes Debout",
        "ebolowa-2",
        "Ebolowa II",
        "Mvila",
        "2026-01-12",
        "2026-08-20",
      ]
    );
  }

  const parentCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM parents_programme;"
  );
  if ((parentCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO parents_programme (id, code_parent, code_acces_hash, langue, arrondissement_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        "parent-1",
        DEMO_CREDENTIALS.parentCodeParent,
        await hashText(DEMO_CREDENTIALS.parentCodeAcces),
        "fr",
        "ebolowa-2",
      ]
    );
  }
}
