import { getDb } from "@/db/client";
import { nouvelIdentifiant } from "@/db/crypto";
import { enqueuer } from "@/db/repositories/syncQueue";
import type { PaquetCohorteServeur, SequenceServeur, UniteServeur } from "@/services/api/facilitateurCohorte";
import type {
  ActiviteTerrain,
  ActiviteType,
  CohortePaquet,
  DifficulteFonctionnelle,
  FideliteReponse,
  Foyer,
  GroupeSoutien,
  ModuleFormation,
  ParentInscrit,
  PresenceStatut,
  Seance,
  Sequence,
  SequenceType,
  SequenceUnite,
  SignalementFacilitateur,
  SignalementGraviteFacilitateur,
  TableauDeBordFacilitateur,
  TypeSignalementFacilitateur,
} from "@/types";

export const EVENEMENTS_ENDPOINT = "/facilitateur/evenements";

/**
 * Dépose un événement dans la file de synchronisation, dans la forme EXACTE
 * attendue par `EvenementController::store` côté serveur de référence :
 * `{ uuid, type, seance_uuid, emis_a, charge }`. Le moteur de synchronisation
 * regroupe tous les événements de cet endpoint en un seul envoi par lot.
 */
async function enqueuerEvenement(
  uuid: string,
  type: string,
  seanceUuid: string | null,
  charge: Record<string, unknown>
): Promise<void> {
  await enqueuer("facilitateur_evenement", "POST", EVENEMENTS_ENDPOINT, {
    uuid,
    type,
    seance_uuid: seanceUuid,
    emis_a: new Date().toISOString(),
    charge,
  });
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/* Cohorte / paquet                                                            */
/* -------------------------------------------------------------------------- */

interface CohorteRow {
  id: string;
  facilitateur_id: string;
  libelle: string;
  arrondissement_id: string;
  ratio_max: number;
  date_debut: string;
  telecharge_le: string | null;
  module_courant_code: string | null;
}

export async function getCohorteDuFacilitateur(
  facilitateurId: string
): Promise<CohorteRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CohorteRow>(
    "SELECT * FROM cohortes WHERE facilitateur_id = ? LIMIT 1;",
    [facilitateurId]
  );
  return row ?? null;
}

export async function marquerCohorteTelechargee(cohorteId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE cohortes SET telecharge_le = ? WHERE id = ?;", [
    new Date().toISOString(),
    cohorteId,
  ]);
}

/**
 * Le serveur de référence ne connaît que deux types de séquence
 * (`unite_digitale` / `consigne_animation`, voir `App\Enums\TypeSequence`)
 * plus un drapeau `est_brise_glace` indépendant — pas les quatre catégories
 * `brise_glace | unite | echange | cloture` que ce kit utilise depuis le
 * départ. On les fait correspondre plutôt que de réécrire tout l'écran
 * Séance : une consigne d'animation non brise-glace devient un "échange",
 * et la dernière du module devient sa "clôture" — le serveur n'a pas de
 * notion explicite de clôture, c'est une convention purement locale.
 */
function mapperTypeSequence(sequence: SequenceServeur, estDerniere: boolean): SequenceType {
  if (sequence.est_brise_glace) return "brise_glace";
  if (sequence.type === "unite_digitale") return "unite";
  return estDerniere ? "cloture" : "echange";
}

/**
 * Notre modèle local ne porte qu'une seule unité numérique par séquence
 * (`Sequence.unite`), là où le serveur en autorise plusieurs. On ne prend
 * que la première : c'est la seule observée dans le curriculum actuel, et
 * l'écran Séance n'a jamais eu besoin d'en afficher plus d'une à la fois.
 */
function mapperUnite(unite: UniteServeur | undefined): SequenceUnite | undefined {
  if (!unite) return undefined;

  const languesDisponibles = Array.from(
    new Set(
      unite.realisations
        .map((r) => r.langue)
        .filter((langue): langue is string => !!langue)
    )
  );
  const audioParLangue: Record<string, string | undefined> = {};
  const texteParLangue: Record<string, string | undefined> = {};
  let pictogrammes: string[] | undefined;

  for (const realisation of unite.realisations) {
    if (!realisation.langue) continue;
    if (realisation.modalite === "audio" && realisation.fichier_audio) {
      audioParLangue[realisation.langue] = realisation.fichier_audio;
    }
    if (realisation.modalite === "texte" && realisation.contenu_texte) {
      texteParLangue[realisation.langue] = realisation.contenu_texte;
    }
    if (realisation.pictogrammes?.length) {
      pictogrammes = realisation.pictogrammes;
    }
  }

  return {
    code: String(unite.id),
    messageCle: unite.message_cle,
    languesDisponibles,
    audioParLangue,
    texteParLangue,
    pictogrammes,
  };
}

export interface ProvisionnerCohorteReelleInput {
  facilitateurId: string;
  cohorteId: number;
  moduleCourantId: number | null;
  paquet: PaquetCohorteServeur;
}

/**
 * `CohorteController::prochaineSeance` peut désigner un module dont le
 * contenu n'a pas encore été rédigé (`renseigne: false`, `sequences: []`) —
 * c'est le cas normal pour un module du programme pas encore écrit. Y faire
 * confiance aveuglément mènerait à une séance sans aucune séquence. On ne
 * la garde que si elle a vraiment du contenu, sinon on prend le premier
 * module renseigné du paquet.
 */
function choisirModuleCourant(
  paquet: PaquetCohorteServeur,
  suggestionId: number | null
): number | null {
  const suggestion = paquet.modules.find((m) => m.id === suggestionId);
  if (suggestion && suggestion.sequences.length > 0) return suggestion.id;

  const premierRenseigne = paquet.modules.find((m) => m.sequences.length > 0);
  return premierRenseigne?.id ?? null;
}

/**
 * Remplace le paquet local par celui, réel, téléchargé depuis le serveur
 * de référence. Contrairement au reste du kit, ces lignes ne portent pas
 * l'UUID d'un événement : elles viennent du serveur, qui a déjà ses
 * propres identifiants (numériques pour la cohorte/les modules/séquences,
 * UUID pour les foyers/groupes).
 */
export async function provisionnerCohorteReelle(
  input: ProvisionnerCohorteReelleInput
): Promise<void> {
  const db = await getDb();
  const cohorteId = String(input.cohorteId);
  const moduleCourantId = choisirModuleCourant(input.paquet, input.moduleCourantId);
  const arrondissementId = (input.paquet.cohorte.arrondissement ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await db.runAsync(
    `INSERT INTO cohortes (id, facilitateur_id, libelle, arrondissement_id, ratio_max, date_debut, module_courant_code, telecharge_le)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       facilitateur_id = excluded.facilitateur_id,
       libelle = excluded.libelle,
       arrondissement_id = excluded.arrondissement_id,
       ratio_max = excluded.ratio_max,
       date_debut = excluded.date_debut,
       module_courant_code = excluded.module_courant_code,
       telecharge_le = excluded.telecharge_le;`,
    [
      cohorteId,
      input.facilitateurId,
      input.paquet.cohorte.libelle,
      arrondissementId,
      input.paquet.cohorte.ratio_max,
      input.paquet.cohorte.date_debut,
      moduleCourantId !== null ? String(moduleCourantId) : null,
      new Date().toISOString(),
    ]
  );

  for (const module of input.paquet.modules) {
    const moduleCode = String(module.id);
    await db.runAsync(
      `INSERT INTO modules_curriculum (code, titre) VALUES (?, ?)
       ON CONFLICT(code) DO UPDATE SET titre = excluded.titre;`,
      [moduleCode, module.titre]
    );

    const sequencesTriees = [...module.sequences].sort((a, b) => a.ordre - b.ordre);
    for (let i = 0; i < sequencesTriees.length; i++) {
      const sequence = sequencesTriees[i];
      const type = mapperTypeSequence(sequence, i === sequencesTriees.length - 1);
      const unite = mapperUnite(sequence.unites[0]);

      await db.runAsync(
        `INSERT INTO sequences_curriculum (
           id, module_code, ordre, titre, type, duree_minutes,
           unite_code, unite_message_cle, unite_langues_disponibles,
           unite_audio_par_langue, unite_texte_par_langue, unite_pictogrammes
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           ordre = excluded.ordre,
           titre = excluded.titre,
           type = excluded.type,
           duree_minutes = excluded.duree_minutes,
           unite_code = excluded.unite_code,
           unite_message_cle = excluded.unite_message_cle,
           unite_langues_disponibles = excluded.unite_langues_disponibles,
           unite_audio_par_langue = excluded.unite_audio_par_langue,
           unite_texte_par_langue = excluded.unite_texte_par_langue,
           unite_pictogrammes = excluded.unite_pictogrammes;`,
        [
          `seq-srv-${sequence.id}`,
          moduleCode,
          sequence.ordre,
          sequence.titre,
          type,
          sequence.duree_minutes,
          unite?.code ?? null,
          unite?.messageCle ?? null,
          unite ? JSON.stringify(unite.languesDisponibles) : null,
          unite ? JSON.stringify(unite.audioParLangue) : null,
          unite ? JSON.stringify(unite.texteParLangue) : null,
          unite?.pictogrammes ? JSON.stringify(unite.pictogrammes) : null,
        ]
      );
    }
  }

  for (const parent of input.paquet.parents) {
    await db.runAsync(
      `INSERT INTO parents_inscrits (id, cohorte_id, code_parent, repere_local)
       VALUES (?, ?, ?, NULL)
       ON CONFLICT(id) DO UPDATE SET cohorte_id = excluded.cohorte_id;`,
      [`parent-${parent.code_parent}`, cohorteId, parent.code_parent]
    );
  }

  for (const foyer of input.paquet.foyers) {
    await db.runAsync(
      `INSERT INTO foyers (id, facilitateur_id, localite, nb_adultes, nb_enfants, difficultes_fonctionnelles_foyer, deja_suivi_programme)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         localite = excluded.localite,
         nb_adultes = excluded.nb_adultes,
         nb_enfants = excluded.nb_enfants,
         difficultes_fonctionnelles_foyer = excluded.difficultes_fonctionnelles_foyer,
         deja_suivi_programme = excluded.deja_suivi_programme;`,
      [
        foyer.uuid,
        input.facilitateurId,
        foyer.localite,
        foyer.nb_adultes,
        foyer.nb_enfants,
        JSON.stringify(foyer.difficultes ?? []),
        foyer.deja_suivi_programme ? 1 : 0,
      ]
    );
  }

  for (const groupe of input.paquet.groupes_soutien) {
    await db.runAsync(
      `INSERT INTO groupes_soutien (id, facilitateur_id, cohorte_id, libelle, date_creation, derniere_reunion)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         libelle = excluded.libelle,
         derniere_reunion = excluded.derniere_reunion;`,
      [
        groupe.uuid,
        input.facilitateurId,
        cohorteId,
        groupe.libelle,
        new Date().toISOString(),
        groupe.derniere_reunion,
      ]
    );
  }

  for (const module of input.paquet.formation) {
    await db.runAsync(
      `INSERT INTO modules_formation (code, titre, type, objectif, duree_minutes)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(code) DO UPDATE SET
         titre = excluded.titre,
         type = excluded.type,
         objectif = excluded.objectif,
         duree_minutes = excluded.duree_minutes;`,
      [module.code, module.titre, module.type, module.objectif, module.duree_minutes]
    );

    for (const section of module.sections) {
      await db.runAsync(
        `INSERT INTO sections_formation (id, module_code, ordre, titre, duree_minutes, corps, fichier_audio)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           titre = excluded.titre,
           duree_minutes = excluded.duree_minutes,
           corps = excluded.corps,
           fichier_audio = excluded.fichier_audio;`,
        [
          `${module.code}-${section.ordre}`,
          module.code,
          section.ordre,
          section.titre,
          section.duree_minutes,
          section.contenu_texte,
          section.fichier_audio,
        ]
      );
    }

    await db.runAsync(
      `INSERT INTO progression_formation (facilitateur_id, module_code, sections_vues)
       VALUES (?, ?, ?)
       ON CONFLICT(facilitateur_id, module_code) DO UPDATE SET
         sections_vues = excluded.sections_vues;`,
      [input.facilitateurId, module.code, JSON.stringify(module.sections_vues ?? [])]
    );
  }
}

interface SequenceCurriculumRow {
  id: string;
  module_code: string;
  ordre: number;
  titre: string;
  type: SequenceType;
  duree_minutes: number;
  unite_code: string | null;
  unite_message_cle: string | null;
  unite_langues_disponibles: string | null;
  unite_audio_par_langue: string | null;
  unite_texte_par_langue: string | null;
  unite_pictogrammes: string | null;
}

function mapSequence(row: SequenceCurriculumRow): Sequence {
  return {
    id: row.id,
    moduleCode: row.module_code,
    ordre: row.ordre,
    titre: row.titre,
    type: row.type,
    dureeMinutes: row.duree_minutes,
    unite: row.unite_code
      ? {
          code: row.unite_code,
          messageCle: row.unite_message_cle ?? "",
          languesDisponibles: parseJson(row.unite_langues_disponibles, []),
          audioParLangue: parseJson(row.unite_audio_par_langue, {}),
          texteParLangue: parseJson(row.unite_texte_par_langue, {}),
          pictogrammes: row.unite_pictogrammes
            ? parseJson(row.unite_pictogrammes, [])
            : undefined,
        }
      : undefined,
  };
}

export async function getSequencesDuModule(moduleCode: string): Promise<Sequence[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SequenceCurriculumRow>(
    "SELECT * FROM sequences_curriculum WHERE module_code = ? ORDER BY ordre ASC;",
    [moduleCode]
  );
  return rows.map(mapSequence);
}

export async function getTitreModule(moduleCode: string): Promise<string> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ titre: string }>(
    "SELECT titre FROM modules_curriculum WHERE code = ?;",
    [moduleCode]
  );
  return row?.titre ?? moduleCode;
}

interface SeanceRow {
  id: string;
  cohorte_id: string;
  module_code: string;
  module_titre: string;
  statut: "en_cours" | "terminee";
  demarree_le: string;
  terminee_le: string | null;
}

function mapSeance(row: SeanceRow): Seance {
  return {
    id: row.id,
    cohorteId: row.cohorte_id,
    moduleCode: row.module_code,
    moduleTitre: row.module_titre,
    statut: row.statut,
    demarreeLe: row.demarree_le,
    termineeLe: row.terminee_le ?? undefined,
  };
}

export async function getSeanceEnCours(cohorteId: string): Promise<Seance | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SeanceRow>(
    "SELECT * FROM seances WHERE cohorte_id = ? AND statut = 'en_cours' ORDER BY demarree_le DESC LIMIT 1;",
    [cohorteId]
  );
  return row ? mapSeance(row) : null;
}

interface ParentInscritRow {
  id: string;
  cohorte_id: string;
  code_parent: string;
  repere_local: string | null;
}

export async function getParentsInscrits(cohorteId: string): Promise<ParentInscrit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ParentInscritRow>(
    "SELECT * FROM parents_inscrits WHERE cohorte_id = ? ORDER BY code_parent ASC;",
    [cohorteId]
  );
  return rows.map((r) => ({
    id: r.id,
    codeParent: r.code_parent,
    repereLocal: r.repere_local ?? undefined,
  }));
}

export async function getPresencesDeLaSeance(
  seanceId: string
): Promise<Record<string, PresenceStatut>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ parent_id: string; statut: PresenceStatut }>(
    "SELECT parent_id, statut FROM presences WHERE seance_id = ?;",
    [seanceId]
  );
  return Object.fromEntries(rows.map((r) => [r.parent_id, r.statut]));
}

export async function getPaquet(facilitateurId: string): Promise<CohortePaquet | null> {
  const cohorte = await getCohorteDuFacilitateur(facilitateurId);
  if (!cohorte) return null;

  const parents = await getParentsInscrits(cohorte.id);
  const seanceEnCours = await getSeanceEnCours(cohorte.id);
  const sequencesModuleEnCours = seanceEnCours
    ? await getSequencesDuModule(seanceEnCours.moduleCode)
    : await getSequencesDuModule(cohorte.module_courant_code ?? "M2");

  return {
    cohorte: {
      id: cohorte.id,
      libelle: cohorte.libelle,
      parents: parents.length,
      ratioMax: cohorte.ratio_max,
      dateDebut: cohorte.date_debut,
    },
    seanceEnCours,
    sequencesModuleEnCours,
    parents,
    telechargeLe: cohorte.telecharge_le ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/* Séance : démarrage, séquences ouvertes, présences, fidélité                */
/* -------------------------------------------------------------------------- */

export async function demarrerSeance(
  cohorteId: string,
  moduleCode: string
): Promise<Seance> {
  const db = await getDb();
  const id = nouvelIdentifiant("seance");
  const demarreeLe = new Date().toISOString();
  const moduleTitre = await getTitreModule(moduleCode);

  await db.runAsync(
    `INSERT INTO seances (id, cohorte_id, module_code, module_titre, statut, demarree_le)
     VALUES (?, ?, ?, ?, 'en_cours', ?)`,
    [id, cohorteId, moduleCode, moduleTitre, demarreeLe]
  );

  await enqueuerEvenement(id, "seance", id, {
    cohorte_id: cohorteId,
    module_code: moduleCode,
    date: demarreeLe.slice(0, 10),
  });

  return { id, cohorteId, moduleCode, moduleTitre, statut: "en_cours", demarreeLe };
}

/**
 * Liste, dans l'ordre où elles ont été ouvertes, les séquences déjà jouées
 * pour cette séance. Sert à retrouver le point de reprise après un
 * changement d'écran (le Drawer garde les écrans montés, donc l'état local
 * du composant Séance ne doit pas être la seule source de vérité).
 */
export async function getSequenceIdsOuvertes(seanceId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ sequence_id: string }>(
    "SELECT sequence_id FROM sequences_ouvertes WHERE seance_id = ? ORDER BY ouverte_a ASC;",
    [seanceId]
  );
  return rows.map((r) => r.sequence_id);
}

export async function ouvrirSequence(
  seanceId: string,
  sequenceId: string,
  dureeReelleSecondes: number
): Promise<void> {
  const db = await getDb();
  const id = nouvelIdentifiant("seqouv");
  const ouverteA = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sequences_ouvertes (id, seance_id, sequence_id, ouverte_a, duree_reelle_secondes)
     VALUES (?, ?, ?, ?, ?)`,
    [id, seanceId, sequenceId, ouverteA, dureeReelleSecondes]
  );

  await enqueuerEvenement(nouvelIdentifiant("evt"), "sequence_ouverte", seanceId, {
    sequence_id: sequenceId,
    ouverte_a: ouverteA,
    duree_reelle_secondes: dureeReelleSecondes,
  });
}

export async function pointerPresence(
  seanceId: string,
  parentId: string,
  statut: PresenceStatut
): Promise<void> {
  const db = await getDb();
  const parent = await db.getFirstAsync<{ code_parent: string }>(
    "SELECT code_parent FROM parents_inscrits WHERE id = ?;",
    [parentId]
  );
  if (!parent) return;

  await db.runAsync(
    `INSERT INTO presences (id, seance_id, parent_id, statut)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(seance_id, parent_id) DO UPDATE SET statut = excluded.statut;`,
    [nouvelIdentifiant("presence"), seanceId, parentId, statut]
  );

  await enqueuerEvenement(nouvelIdentifiant("evt"), "presence", seanceId, {
    code_parent: parent.code_parent,
    statut,
  });
}

/**
 * Un repère est une note privée à l'appareil : jamais mise en file, jamais
 * synchronisée, effacée avec le paquet.
 */
export async function definirRepereLocal(
  parentId: string,
  repere: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE parents_inscrits SET repere_local = ? WHERE id = ?;", [
    repere,
    parentId,
  ]);
}

export async function soumettreFidelite(
  seanceId: string,
  reponses: FideliteReponse[],
  commentaireGeneral: string | undefined
): Promise<void> {
  const db = await getDb();

  for (const reponse of reponses) {
    await db.runAsync(
      `INSERT INTO fiches_fidelite (id, seance_id, sequence_id, realisee_bool, note_qualite, commentaire)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nouvelIdentifiant("fidelite"),
        seanceId,
        reponse.sequenceId,
        reponse.realisee ? 1 : 0,
        reponse.qualite ?? null,
        reponse.commentaire ?? null,
      ]
    );
    await enqueuerEvenement(nouvelIdentifiant("evt"), "fiche_fidelite", seanceId, {
      sequence_id: reponse.sequenceId,
      realisee_bool: reponse.realisee,
      note_qualite: reponse.qualite ?? null,
      commentaire: reponse.commentaire ?? null,
    });
  }

  if (commentaireGeneral?.trim()) {
    await db.runAsync(
      `INSERT INTO fiches_fidelite (id, seance_id, sequence_id, realisee_bool, note_qualite, commentaire)
       VALUES (?, ?, NULL, NULL, NULL, ?)`,
      [nouvelIdentifiant("fidelite"), seanceId, commentaireGeneral.trim()]
    );
    await enqueuerEvenement(nouvelIdentifiant("evt"), "bilan_seance", seanceId, {
      commentaire: commentaireGeneral.trim(),
    });
  }

  await db.runAsync(
    "UPDATE seances SET statut = 'terminee', terminee_le = ? WHERE id = ?;",
    [new Date().toISOString(), seanceId]
  );
}

/* -------------------------------------------------------------------------- */
/* Inscription d'un parent                                                    */
/* -------------------------------------------------------------------------- */

export interface InscrireParentInput {
  cohorteId: string;
  langue: string;
  situation: "union" | "seul" | "non_renseigne";
  revenu: "regulier" | "irregulier" | "aucun" | "non_renseigne";
  telephonePartage: boolean;
  repereLocal?: string;
}

export async function inscrireParent(
  input: InscrireParentInput
): Promise<{ codeParent: string; codeAcces: string }> {
  const db = await getDb();
  const count = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM parents_inscrits WHERE cohorte_id = ?;",
    [input.cohorteId]
  );
  const numero = (count?.n ?? 0) + 1;
  const codeParent = `EB2-${String(numero).padStart(2, "0")}`;
  const codeAcces = String(Math.floor(1000 + Math.random() * 9000));
  const id = nouvelIdentifiant("parent");

  await db.runAsync(
    `INSERT INTO parents_inscrits (id, cohorte_id, code_parent, repere_local)
     VALUES (?, ?, ?, ?)`,
    [id, input.cohorteId, codeParent, input.repereLocal ?? null]
  );

  await enqueuerEvenement(id, "inscription_parent", null, {
    cohorte_id: input.cohorteId,
    code_parent: codeParent,
    code_acces: codeAcces,
    langue_pref: input.langue,
    statut_matrimonial: input.situation,
    revenu_regularite: input.revenu,
    telephone_partage: input.telephonePartage,
  });

  return { codeParent, codeAcces };
}

/* -------------------------------------------------------------------------- */
/* Activités, foyers, visites, groupes de soutien, signalements               */
/* -------------------------------------------------------------------------- */

interface ActiviteRow {
  id: string;
  cohorte_id: string | null;
  type: ActiviteType;
  date: string;
  lieu: string;
  duree_minutes: number;
  nb_parents_touches: number;
  nb_hommes: number;
  nb_femmes: number;
  nb_participants_handicap: number;
  commentaire: string | null;
  groupe_soutien_id: string | null;
}

function mapActivite(row: ActiviteRow): ActiviteTerrain {
  return {
    id: row.id,
    cohorteId: row.cohorte_id ?? undefined,
    type: row.type,
    date: row.date,
    dureeMinutes: row.duree_minutes,
    lieu: row.lieu,
    groupeSoutienId: row.groupe_soutien_id ?? undefined,
    commentaire: row.commentaire ?? undefined,
    personnesTouchees: row.nb_parents_touches,
    dontHandicap: row.nb_participants_handicap,
    hommes: row.nb_hommes,
    femmes: row.nb_femmes,
  };
}

export async function getActivites(facilitateurId: string): Promise<ActiviteTerrain[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActiviteRow>(
    "SELECT * FROM activites WHERE facilitateur_id = ? ORDER BY date DESC;",
    [facilitateurId]
  );
  return rows.map(mapActivite);
}

export interface EnregistrerActiviteInput {
  facilitateurId: string;
  cohorteId?: string;
  type: ActiviteType;
  date: string;
  dureeMinutes: number;
  lieu: string;
  groupeSoutienId?: string;
  commentaire?: string;
  personnesTouchees: number;
  dontHandicap: number;
  hommes: number;
  femmes: number;
}

export async function enregistrerActivite(
  input: EnregistrerActiviteInput
): Promise<ActiviteTerrain> {
  const db = await getDb();
  const id = nouvelIdentifiant("activite");

  await db.runAsync(
    `INSERT INTO activites
      (id, facilitateur_id, cohorte_id, type, date, lieu, duree_minutes,
       nb_parents_touches, nb_hommes, nb_femmes, nb_participants_handicap, commentaire, groupe_soutien_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.facilitateurId,
      input.cohorteId ?? null,
      input.type,
      input.date,
      input.lieu,
      input.dureeMinutes,
      input.personnesTouchees,
      input.hommes,
      input.femmes,
      input.dontHandicap,
      input.commentaire ?? null,
      input.groupeSoutienId ?? null,
    ]
  );

  await db.runAsync(
    "UPDATE facilitateurs SET derniere_activite = ? WHERE id = ? AND (derniere_activite IS NULL OR derniere_activite < ?);",
    [input.date, input.facilitateurId, input.date]
  );

  if (input.type === "reunion_gsp" && input.groupeSoutienId) {
    await db.runAsync(
      "UPDATE groupes_soutien SET derniere_reunion = ? WHERE id = ? AND (derniere_reunion IS NULL OR derniere_reunion < ?);",
      [input.date, input.groupeSoutienId, input.date]
    );
  }

  await enqueuerEvenement(id, "activite", null, {
    cohorte_id: input.cohorteId ?? null,
    type: input.type,
    date: input.date,
    lieu: input.lieu,
    duree_minutes: input.dureeMinutes,
    nb_parents_touches: input.personnesTouchees,
    nb_hommes: input.hommes,
    nb_femmes: input.femmes,
    nb_participants_handicap: input.dontHandicap,
    commentaire: input.commentaire ?? null,
    gsp_uuid: input.groupeSoutienId ?? null,
  });

  return mapActivite({
    id,
    cohorte_id: input.cohorteId ?? null,
    type: input.type,
    date: input.date,
    lieu: input.lieu,
    duree_minutes: input.dureeMinutes,
    nb_parents_touches: input.personnesTouchees,
    nb_hommes: input.hommes,
    nb_femmes: input.femmes,
    nb_participants_handicap: input.dontHandicap,
    commentaire: input.commentaire ?? null,
    groupe_soutien_id: input.groupeSoutienId ?? null,
  });
}

interface FoyerRow {
  id: string;
  localite: string;
  nb_adultes: number;
  nb_enfants: number;
  difficultes_fonctionnelles_foyer: string | null;
  deja_suivi_programme: number;
}

function mapFoyer(row: FoyerRow): Foyer {
  return {
    id: row.id,
    localite: row.localite,
    adultes: row.nb_adultes,
    enfants: row.nb_enfants,
    difficultesFonctionnelles: parseJson<DifficulteFonctionnelle[]>(
      row.difficultes_fonctionnelles_foyer,
      []
    ),
    dejaParticipeProgramme: !!row.deja_suivi_programme,
  };
}

export async function getFoyers(facilitateurId: string): Promise<Foyer[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<FoyerRow>(
    "SELECT * FROM foyers WHERE facilitateur_id = ? ORDER BY localite ASC;",
    [facilitateurId]
  );
  return rows.map(mapFoyer);
}

export interface EnregistrerVisiteInput {
  facilitateurId: string;
  foyer:
    | { foyerId: string }
    | {
        localite: string;
        adultes: number;
        enfants: number;
        difficultesFonctionnelles: DifficulteFonctionnelle[];
        dejaParticipeProgramme: boolean;
      };
  date: string;
  observations: string[];
  suiviPrevu: boolean;
}

export async function enregistrerVisite(input: EnregistrerVisiteInput): Promise<void> {
  const db = await getDb();
  let foyerId: string;

  if ("foyerId" in input.foyer) {
    foyerId = input.foyer.foyerId;
  } else {
    foyerId = nouvelIdentifiant("foyer");
    await db.runAsync(
      `INSERT INTO foyers (id, facilitateur_id, localite, nb_adultes, nb_enfants, difficultes_fonctionnelles_foyer, deja_suivi_programme)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        foyerId,
        input.facilitateurId,
        input.foyer.localite,
        input.foyer.adultes,
        input.foyer.enfants,
        JSON.stringify(input.foyer.difficultesFonctionnelles),
        input.foyer.dejaParticipeProgramme ? 1 : 0,
      ]
    );
    await enqueuerEvenement(foyerId, "foyer", null, {
      localite: input.foyer.localite,
      nb_adultes: input.foyer.adultes,
      nb_enfants: input.foyer.enfants,
      difficultes_fonctionnelles_foyer: input.foyer.difficultesFonctionnelles,
      deja_suivi_programme: input.foyer.dejaParticipeProgramme,
    });
  }

  const visiteId = nouvelIdentifiant("visite");
  await db.runAsync(
    `INSERT INTO visites (id, foyer_id, facilitateur_id, date, observations_structurees, suivi_prevu)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      visiteId,
      foyerId,
      input.facilitateurId,
      input.date,
      JSON.stringify(input.observations),
      input.suiviPrevu ? 1 : 0,
    ]
  );

  await enqueuerEvenement(visiteId, "visite", null, {
    foyer_uuid: foyerId,
    date: input.date,
    observations_structurees: input.observations,
    suivi_prevu: input.suiviPrevu,
  });
}

interface GroupeSoutienRow {
  id: string;
  libelle: string;
  date_creation: string;
  derniere_reunion: string | null;
}

export async function getGroupesSoutien(
  facilitateurId: string
): Promise<GroupeSoutien[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<GroupeSoutienRow>(
    "SELECT id, libelle, date_creation, derniere_reunion FROM groupes_soutien WHERE facilitateur_id = ? ORDER BY libelle ASC;",
    [facilitateurId]
  );
  return rows.map((r) => ({
    id: r.id,
    nom: r.libelle,
    dateCreation: r.date_creation,
    derniereReunion: r.derniere_reunion ?? undefined,
  }));
}

interface SignalementRow {
  id: string;
  type: TypeSignalementFacilitateur;
  gravite: SignalementGraviteFacilitateur;
  statut: SignalementFacilitateur["statut"];
  soumis_le: string;
}

function joursDepuis(dateIso: string): number {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export async function getSignalements(
  facilitateurId: string
): Promise<SignalementFacilitateur[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SignalementRow>(
    "SELECT id, type, gravite, statut, soumis_le FROM signalements_facilitateur WHERE facilitateur_id = ? ORDER BY soumis_le DESC;",
    [facilitateurId]
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    gravite: r.gravite,
    soumisLe: r.soumis_le,
    statut: r.statut,
    joursAttente: r.statut === "clos" ? 0 : joursDepuis(r.soumis_le),
  }));
}

export interface SoumettreSignalementInput {
  facilitateurId: string;
  type: TypeSignalementFacilitateur;
  gravite: SignalementGraviteFacilitateur;
  activiteId?: string;
}

export async function soumettreSignalement(
  input: SoumettreSignalementInput
): Promise<SignalementFacilitateur> {
  const db = await getDb();
  const id = nouvelIdentifiant("signalement");
  const soumisLe = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO signalements_facilitateur (id, facilitateur_id, activite_id, type, gravite, statut, soumis_le)
     VALUES (?, ?, ?, ?, ?, 'soumis', ?)`,
    [id, input.facilitateurId, input.activiteId ?? null, input.type, input.gravite, soumisLe]
  );

  await enqueuerEvenement(id, "signalement", null, {
    type: input.type,
    gravite: input.gravite,
    activite_uuid: input.activiteId ?? null,
  });

  return {
    id,
    type: input.type,
    gravite: input.gravite,
    soumisLe,
    statut: "soumis",
    joursAttente: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Formation                                                                   */
/* -------------------------------------------------------------------------- */

interface SectionFormationRow {
  id: string;
  module_code: string;
  ordre: number;
  titre: string;
  duree_minutes: number;
  corps: string;
  fichier_audio: string | null;
}

export async function getModulesFormation(
  facilitateurId: string
): Promise<ModuleFormation[]> {
  const db = await getDb();
  const modules = await db.getAllAsync<{
    code: string;
    titre: string;
    type: string;
    objectif: string;
    duree_minutes: number;
  }>("SELECT * FROM modules_formation;");

  const result: ModuleFormation[] = [];
  for (const m of modules) {
    const sections = await db.getAllAsync<SectionFormationRow>(
      "SELECT * FROM sections_formation WHERE module_code = ? ORDER BY ordre ASC;",
      [m.code]
    );
    const progression = await db.getFirstAsync<{
      sections_vues: string;
      termine_a: string | null;
    }>(
      "SELECT sections_vues, termine_a FROM progression_formation WHERE facilitateur_id = ? AND module_code = ?;",
      [facilitateurId, m.code]
    );
    const sectionsVues = new Set(parseJson<number[]>(progression?.sections_vues ?? null, []));

    result.push({
      code: m.code,
      titre: m.titre,
      type: m.type,
      objectif: m.objectif,
      dureeMinutes: m.duree_minutes,
      sections: sections.map((s) => ({
        id: s.id,
        moduleCode: s.module_code,
        ordre: s.ordre,
        titre: s.titre,
        dureeMinutes: s.duree_minutes,
        corps: s.corps,
        fichierAudio: s.fichier_audio ?? undefined,
        lue: sectionsVues.has(s.ordre),
      })),
      progression: sections.length ? sectionsVues.size / sections.length : 0,
      termine: !!progression?.termine_a,
    });
  }
  return result;
}

export async function marquerSectionLue(
  facilitateurId: string,
  moduleCode: string,
  sectionOrdre: number
): Promise<void> {
  const db = await getDb();
  const existant = await db.getFirstAsync<{ sections_vues: string }>(
    "SELECT sections_vues FROM progression_formation WHERE facilitateur_id = ? AND module_code = ?;",
    [facilitateurId, moduleCode]
  );
  const sectionsVues = new Set(parseJson<number[]>(existant?.sections_vues ?? null, []));
  sectionsVues.add(sectionOrdre);

  const totalSections = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM sections_formation WHERE module_code = ?;",
    [moduleCode]
  );
  const termine = (totalSections?.n ?? 0) > 0 && sectionsVues.size >= (totalSections?.n ?? 0);
  const ouverteA = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO progression_formation (facilitateur_id, module_code, sections_vues, derniere_ouverture, termine_a)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(facilitateur_id, module_code) DO UPDATE SET
       sections_vues = excluded.sections_vues,
       derniere_ouverture = excluded.derniere_ouverture,
       termine_a = COALESCE(progression_formation.termine_a, excluded.termine_a);`,
    [
      facilitateurId,
      moduleCode,
      JSON.stringify(Array.from(sectionsVues).sort((a, b) => a - b)),
      ouverteA,
      termine ? ouverteA : null,
    ]
  );

  await enqueuerEvenement(nouvelIdentifiant("evt"), "progression_formation", null, {
    module_code: moduleCode,
    sections_vues: Array.from(sectionsVues),
    ouverte_a: ouverteA,
  });
}

/* -------------------------------------------------------------------------- */
/* Tableau de bord                                                            */
/* -------------------------------------------------------------------------- */

export async function getTableauDeBord(
  facilitateurId: string
): Promise<TableauDeBordFacilitateur> {
  const db = await getDb();
  const cohorte = await getCohorteDuFacilitateur(facilitateurId);
  const parents = cohorte ? await getParentsInscrits(cohorte.id) : [];
  const seancesTenues = cohorte
    ? (
        await db.getFirstAsync<{ n: number }>(
          "SELECT COUNT(*) as n FROM seances WHERE cohorte_id = ? AND statut = 'terminee';",
          [cohorte.id]
        )
      )?.n ?? 0
    : 0;

  const activites = await db.getAllAsync<ActiviteRow>(
    "SELECT * FROM activites WHERE facilitateur_id = ?;",
    [facilitateurId]
  );
  const foyers = await getFoyers(facilitateurId);
  const groupes = await getGroupesSoutien(facilitateurId);
  const signalements = await getSignalements(facilitateurId);

  const personnesTouchees = activites.reduce((sum, a) => sum + a.nb_parents_touches, 0);
  const hommes = activites.reduce((sum, a) => sum + a.nb_hommes, 0);
  const femmes = activites.reduce((sum, a) => sum + a.nb_femmes, 0);
  const participantsHandicap = activites.reduce(
    (sum, a) => sum + a.nb_participants_handicap,
    0
  );

  return {
    cohortes: cohorte ? 1 : 0,
    parentsInscrits: parents.length,
    seancesTenues,
    ecartsReleves: 0,
    doseMoyenne: parents.length ? Number((seancesTenues / parents.length).toFixed(2)) : 0,
    delaiMoyenRemontee: 0,
    activites: activites.length,
    personnesTouchees,
    hommes,
    femmes,
    foyersSuivis: foyers.length,
    foyersDifficulteFonctionnelle: foyers.filter((f) => f.difficultesFonctionnelles.length > 0)
      .length,
    groupesSoutienActifs: groupes.length,
    participantsHandicap,
    signalementsAttente: signalements.filter((s) => s.statut !== "clos").length,
  };
}
