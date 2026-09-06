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

  await seedDomaineFacilitateur(db);
}

/**
 * Le "paquet" qu'un facilitateur téléchargerait de son superviseur : une
 * cohorte, le curriculum du module en cours, ses parents inscrits, et sa
 * formation. Un foyer et un groupe de soutien pré-existants permettent de
 * tester tout de suite les écrans qui proposent "en choisir un existant".
 */
async function seedDomaineFacilitateur(db: SQLiteDatabase): Promise<void> {
  const cohorteCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM cohortes;"
  );
  if ((cohorteCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO cohortes (id, facilitateur_id, libelle, arrondissement_id, ratio_max, date_debut, telecharge_le)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      ["coh-1", "fac-1", "Cohorte A — Ngoazip", "ebolowa-2", 25, "2026-03-01"]
    );

    for (let i = 1; i <= 5; i++) {
      await db.runAsync(
        `INSERT INTO parents_inscrits (id, cohorte_id, code_parent, repere_local)
         VALUES (?, ?, ?, NULL)`,
        [`p-${i}`, "coh-1", `EB2-${String(i).padStart(2, "0")}`]
      );
    }
  }

  const moduleCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM modules_curriculum;"
  );
  if ((moduleCount?.n ?? 0) === 0) {
    await db.runAsync(
      "INSERT INTO modules_curriculum (code, titre) VALUES (?, ?);",
      ["M2", "Discipline positive"]
    );

    const sequences: [string, number, string, string, number, string | null, string | null, string[], Record<string, string>, Record<string, string>, string[] | null][] = [
      ["seq-1", 1, "Brise-glace", "brise_glace", 5, null, null, [], {}, {}, null],
      [
        "seq-2",
        2,
        "Pourquoi la punition corporelle ne marche pas",
        "unite",
        15,
        "M2-U1",
        "punition_corporelle_effets",
        ["fr", "bulu"],
        { fr: "m2-u1-fr.mp3", bulu: "m2-u1-bulu.mp3" },
        { fr: "La punition corporelle enseigne la peur, pas la règle." },
        ["colere.png", "enfant-triste.png"],
      ],
      [
        "seq-3",
        3,
        "Trois alternatives concrètes",
        "unite",
        20,
        "M2-U2",
        "alternatives_discipline",
        ["fr"],
        { fr: "m2-u2-fr.mp3" },
        { fr: "Retrait calme, conséquence logique, dialogue après coup." },
        null,
      ],
      ["seq-4", 4, "Échanges en groupe", "echange", 10, null, null, [], {}, {}, null],
      ["seq-5", 5, "Clôture", "cloture", 5, null, null, [], {}, {}, null],
    ];

    for (const [
      id,
      ordre,
      titre,
      type,
      dureeMinutes,
      uniteCode,
      uniteMessageCle,
      langues,
      audio,
      texte,
      pictos,
    ] of sequences) {
      await db.runAsync(
        `INSERT INTO sequences_curriculum
          (id, module_code, ordre, titre, type, duree_minutes, unite_code, unite_message_cle,
           unite_langues_disponibles, unite_audio_par_langue, unite_texte_par_langue, unite_pictogrammes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          "M2",
          ordre,
          titre,
          type,
          dureeMinutes,
          uniteCode,
          uniteMessageCle,
          JSON.stringify(langues),
          JSON.stringify(audio),
          JSON.stringify(texte),
          pictos ? JSON.stringify(pictos) : null,
        ]
      );
    }
  }

  const foyerCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM foyers;"
  );
  if ((foyerCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO foyers (id, facilitateur_id, localite, nb_adultes, nb_enfants, difficultes_fonctionnelles_foyer, deja_suivi_programme)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["foyer-1", "fac-1", "Quartier Nko'ovos", 2, 3, "[]", 1]
    );
  }

  const groupeCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM groupes_soutien;"
  );
  if ((groupeCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO groupes_soutien (id, facilitateur_id, cohorte_id, libelle, date_creation, derniere_reunion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["gsp-1", "fac-1", "coh-1", "Groupe de soutien Ngoazip", "2026-04-01", "2026-08-20"]
    );
  }

  const moduleFormationCount = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM modules_formation;"
  );
  if ((moduleFormationCount?.n ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO modules_formation (code, titre, type, objectif, duree_minutes) VALUES (?, ?, ?, ?, ?)`,
      [
        "F1",
        "Poser une séance sans juger",
        "obligatoire",
        "Reconnaître un déroulé fidèle sans le confondre avec un contrôle.",
        40,
      ]
    );
    await db.runAsync(
      `INSERT INTO modules_formation (code, titre, type, objectif, duree_minutes) VALUES (?, ?, ?, ?, ?)`,
      [
        "F2",
        "Repérer un signalement",
        "obligatoire",
        "Distinguer une observation à signaler d'un jugement personnel.",
        30,
      ]
    );

    const sections: [string, string, number, string, number, string][] = [
      [
        "f1-s1",
        "F1",
        1,
        "Ce qu'une séance fidèle veut dire",
        10,
        "Une séance fidèle suit le déroulé, pas le silence du groupe.",
      ],
      [
        "f1-s2",
        "F1",
        2,
        "Le brise-glace n'est pas un remplissage",
        10,
        "Le temps libre du brise-glace fait partie du déroulé, pas un à-côté.",
      ],
      [
        "f2-s1",
        "F2",
        1,
        "Observer sans nommer",
        15,
        "Décrire un fait observable, jamais une intention supposée.",
      ],
      [
        "f2-s2",
        "F2",
        2,
        "Ce qui arrive après un signalement",
        15,
        "Aucune autorité n'est prévenue automatiquement : un humain juge.",
      ],
    ];
    for (const [id, moduleCode, ordre, titre, dureeMinutes, corps] of sections) {
      await db.runAsync(
        `INSERT INTO sections_formation (id, module_code, ordre, titre, duree_minutes, corps)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, moduleCode, ordre, titre, dureeMinutes, corps]
      );
    }

    await db.runAsync(
      `INSERT INTO progression_formation (facilitateur_id, module_code, sections_vues, derniere_ouverture, termine_a)
       VALUES (?, ?, ?, ?, ?)`,
      ["fac-1", "F1", JSON.stringify([1, 2]), "2026-08-01", "2026-08-01"]
    );
    await db.runAsync(
      `INSERT INTO progression_formation (facilitateur_id, module_code, sections_vues, derniere_ouverture, termine_a)
       VALUES (?, ?, ?, ?, ?)`,
      ["fac-1", "F2", JSON.stringify([1]), "2026-08-15", null]
    );
  }
}
