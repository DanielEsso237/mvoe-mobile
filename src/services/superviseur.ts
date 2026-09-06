import { getJetonApiSuperviseur } from "@/db/repositories/auth";
import { enqueuer } from "@/db/repositories/syncQueue";
import { MOCK_CAMPAGNES } from "@/mocks/superviseur";
import {
  enregistrerFacilitateurEnLigne,
  getCohortesSuperviseurEnLigne,
  getRapportEnLigne,
  getRegistreEnLigne,
  getSignalementsSuperviseurEnLigne,
  getTableauDeBordEnLigne,
  patchRatioCohorteEnLigne,
  regenererIdentifiantsEnLigne,
  type CohorteSuperviseurServeur,
  type FacilitateurRegistreServeur,
  type PorteeServeur,
  type SignalementServeur,
  type TableauDeBordServeur,
} from "@/services/api/superviseurDonnees";
import { ApiResponseError } from "@/services/api/client";
import type {
  Campagne,
  Cohorte,
  DecoupageEntite,
  Facilitateur,
  IdentifiantsFacilitateur,
  NiveauPortee,
  ParametreCohorte,
  Portee,
  Rapport,
  Signalement,
  SignalementGravite,
  SignalementStatut,
  TableauDeBordIndicateurs,
  TypeJuridique,
  TypeSignalementFacilitateur,
} from "@/types";
import { TYPES_JURIDIQUES } from "@/types";
import { ApiError } from "./client";

/**
 * Ce module lit et écrit directement l'API du serveur de référence : le
 * superviseur travaille depuis un bureau, quasiment toujours en ligne,
 * contrairement au facilitateur sur le terrain. Il n'y a donc pas de copie
 * SQLite de ces données (elles seraient périmées dès l'écran affiché) — la
 * seule exception est le traitement d'un signalement (`updateSignalement`),
 * une écriture ponctuelle qui mérite de survivre une coupure réseau, et qui
 * passe par la file générique (`src/db/repositories/syncQueue.ts`).
 */

async function jeton(superviseurId: string): Promise<string> {
  const t = await getJetonApiSuperviseur(superviseurId);
  if (!t) throw new ApiError("Reconnectez-vous en ligne pour accéder à ces données.");
  return t;
}

/** Relit le message d'erreur Laravel (`{"message": "..."}`) quand il existe. */
function relancerErreurApi(error: unknown, repli: string): never {
  if (error instanceof ApiResponseError) {
    try {
      const corps = JSON.parse(error.message) as { message?: string };
      throw new ApiError(corps.message ?? repli);
    } catch {
      throw new ApiError(repli);
    }
  }
  throw new ApiError(repli);
}

function mapPortee(p: PorteeServeur, entiteId: string | null = null): Portee {
  return { niveau: p.niveau as NiveauPortee, entiteId, libelle: p.libelle };
}

function mapTableauDeBord(serveur: TableauDeBordServeur): TableauDeBordIndicateurs {
  const i = serveur.indicateurs;
  const decoupageNiveau = serveur.decoupage?.niveau as DecoupageEntite["niveau"] | undefined;
  return {
    portee: mapPortee(serveur.portee),
    fil: serveur.fil.map((f) => ({
      niveau: (f.niveau ?? "national") as NiveauPortee,
      entiteId: f.entite !== null ? String(f.entite) : null,
      libelle: f.libelle,
    })),
    facilitateursActifs: i.facilitateurs_actifs,
    facilitateursFormes: i.facilitateurs_formes,
    cohortes: i.cohortes,
    parentsInscrits: i.parents_inscrits,
    seancesTenues: i.seances_tenues,
    seancesParParent: i.dose_moyenne_par_parent ?? 0,
    ecarts: i.ecarts_releves,
    joursRemontee: i.delai_moyen_remontee_jours ?? 0,
    activites: i.activites,
    personnesTouchees: i.parents_touches,
    femmes: i.dont_femmes,
    hommes: i.dont_hommes,
    foyersSuivis: i.foyers_suivis,
    foyersDifficulteFonctionnelle: i.foyers_avec_difficulte,
    groupesSoutienActifs: i.groupes_actifs,
    groupesSoutienTotal: i.groupes_soutien,
    participantsHandicap: i.participants_handicap,
    signalementsAttente: i.signalements_a_traiter,
    signalementsTotal: i.signalements,
    decoupage: (serveur.decoupage?.lignes ?? []).map((l) => ({
      id: String(l.id),
      niveau: decoupageNiveau ?? "arrondissement",
      nom: l.libelle,
      cohortes: l.cohortes,
      parents: l.parents_inscrits,
      seances: l.seances_tenues,
      ecarts: l.ecarts_releves,
    })),
  };
}

export async function getTableauDeBord(
  superviseurId: string
): Promise<TableauDeBordIndicateurs> {
  const reponse = await getTableauDeBordEnLigne(await jeton(superviseurId));
  return mapTableauDeBord(reponse);
}

function mapFacilitateur(f: FacilitateurRegistreServeur): Facilitateur {
  return {
    id: String(f.id),
    nom: f.nom,
    telephone: f.telephone,
    typeJuridique: f.type_juridique,
    organisationRattachement: f.organisation_rattachement ?? undefined,
    arrondissementId: f.arrondissement,
    arrondissementNom: f.arrondissement,
    departementNom: f.departement,
    dateFormationInitiale: f.date_formation_initiale,
    derniereActivite: f.derniere_activite,
    seancesAnimees: f.seances_animees,
    modulesTermines: f.modules_termines,
    modulesDiffusables: 0,
    modulesEnCours: f.modules_ouverts,
    statut: f.actif ? "actif" : f.jours_depuis_activite === null ? "jamais_actif" : "inactif",
  };
}

export async function getRegistre(
  superviseurId: string,
  arrondissementId?: string
): Promise<Facilitateur[]> {
  const reponse = await getRegistreEnLigne(
    await jeton(superviseurId),
    arrondissementId ? Number(arrondissementId) : undefined
  );
  return reponse.facilitateurs.map(mapFacilitateur);
}

export async function getTypesJuridiques(): Promise<
  { value: TypeJuridique; label: string }[]
> {
  // Liste statique, alignée sur `App\Enums\TypeJuridique` : pas besoin d'un
  // aller-retour réseau pour peupler un menu déroulant qui ne change jamais.
  return TYPES_JURIDIQUES;
}

export interface EnregistrerFacilitateurInput {
  nom: string;
  telephone: string;
  email?: string;
  typeJuridique: TypeJuridique;
  dateFormationInitiale: string;
  organisationRattachement?: string;
}

export async function enregistrerFacilitateur(
  superviseurId: string,
  input: EnregistrerFacilitateurInput
): Promise<{ facilitateur: Facilitateur; identifiants: IdentifiantsFacilitateur }> {
  try {
    const reponse = await enregistrerFacilitateurEnLigne(await jeton(superviseurId), {
      nom: input.nom,
      telephone: input.telephone,
      email: input.email,
      type_juridique: input.typeJuridique,
      organisation_rattachement: input.organisationRattachement,
      date_formation_initiale: input.dateFormationInitiale,
    });
    return {
      facilitateur: {
        id: String(reponse.facilitateur.id),
        nom: reponse.facilitateur.nom,
        telephone: input.telephone,
        typeJuridique: reponse.facilitateur.type_juridique,
        organisationRattachement: input.organisationRattachement,
        arrondissementId: reponse.facilitateur.arrondissement,
        arrondissementNom: reponse.facilitateur.arrondissement,
        departementNom: reponse.facilitateur.arrondissement,
        dateFormationInitiale: reponse.facilitateur.date_formation_initiale,
        derniereActivite: null,
        seancesAnimees: 0,
        modulesTermines: 0,
        modulesDiffusables: 0,
        modulesEnCours: 0,
        statut: "jamais_actif",
      },
      identifiants: {
        telephone: reponse.identifiants.telephone,
        codeAppareil: reponse.identifiants.code_appareil,
        email: reponse.identifiants.email,
        motDePasse: reponse.identifiants.mot_de_passe,
      },
    };
  } catch (error) {
    relancerErreurApi(error, "L'enregistrement a échoué.");
  }
}

export async function regenererIdentifiants(
  superviseurId: string,
  facilitateurId: string
): Promise<IdentifiantsFacilitateur> {
  try {
    const reponse = await regenererIdentifiantsEnLigne(
      await jeton(superviseurId),
      Number(facilitateurId)
    );
    return {
      telephone: reponse.identifiants.telephone,
      codeAppareil: reponse.identifiants.code_appareil,
      email: reponse.identifiants.email,
      motDePasse: reponse.identifiants.mot_de_passe,
    };
  } catch (error) {
    relancerErreurApi(error, "La régénération a échoué.");
  }
}

function mapCohorte(c: CohorteSuperviseurServeur): Cohorte {
  return {
    id: String(c.id),
    libelle: c.libelle,
    arrondissementId: c.arrondissement,
    arrondissementNom: c.arrondissement,
    effectif: c.effectif,
    ratioMax: c.ratio_max,
    seances: c.seances_tenues,
    dateDebut: c.date_debut,
  };
}

export async function getCohortes(superviseurId: string): Promise<Cohorte[]> {
  const reponse = await getCohortesSuperviseurEnLigne(await jeton(superviseurId));
  return reponse.cohortes.map(mapCohorte);
}

export async function updateParametreCohorte(
  superviseurId: string,
  cohorteId: string,
  ratioMax: number
): Promise<ParametreCohorte> {
  try {
    const reponse = await patchRatioCohorteEnLigne(
      await jeton(superviseurId),
      Number(cohorteId),
      ratioMax
    );
    return {
      cohorteId,
      ratioMax: reponse.cohorte.ratio_max,
      effectifActuel: reponse.cohorte.effectif,
    };
  } catch (error) {
    relancerErreurApi(error, "La modification a échoué.");
  }
}

export async function getRapport(
  superviseurId: string,
  annee: number,
  trimestre: 1 | 2 | 3 | 4
): Promise<Rapport> {
  const r = await getRapportEnLigne(await jeton(superviseurId), annee, trimestre);
  return {
    annee: r.periode.annee,
    trimestre: r.periode.trimestre as 1 | 2 | 3 | 4,
    portee: mapPortee(r.portee),
    etabliLe: new Date().toLocaleDateString("fr-FR"),
    seancesTenues: r.synthese.seances_tenues,
    cohortesActives: r.synthese.cohortes_actives,
    doseMoyenne: r.synthese.dose_moyenne_par_parent ?? 0,
    ecartsTotal: r.synthese.ecarts_total,
    cohortes: r.cohortes.map((c) => ({
      libelle: c.libelle,
      arrondissementNom: c.arrondissement,
      effectif: c.effectif,
      ratioMax: c.ratio_max,
      seances: c.seances_tenues,
    })),
    ecarts: r.facilitateurs.map((f) => ({
      facilitateurNom: f.nom,
      seances: f.seances,
      sequencesRealisees: f.sequences_declarees_realisees,
      declareesJamaisOuvertes: f.declarees_jamais_ouvertes,
      ouvertesDeclareesNonFaites: f.ouvertes_declarees_non_faites,
      delaiMoyenRemontee: f.delai_moyen_remontee_jours ?? 0,
    })),
  };
}

function mapSignalement(s: SignalementServeur): Signalement {
  return {
    id: String(s.id),
    type: s.type as TypeSignalementFacilitateur,
    gravite: s.gravite as SignalementGravite,
    statut: s.statut as SignalementStatut,
    arrondissementId: s.arrondissement,
    arrondissementNom: s.arrondissement,
    facilitateurNom: s.facilitateur,
    soumisLe: s.soumis_le,
    joursAttente: s.jours_attente,
    suiteDonnee: s.suite_donnee ?? undefined,
  };
}

export async function getSignalements(superviseurId: string): Promise<Signalement[]> {
  const reponse = await getSignalementsSuperviseurEnLigne(await jeton(superviseurId));
  return reponse.signalements.map(mapSignalement);
}

export interface UpdateSignalementInput {
  statut: SignalementStatut;
  suiteDonnee?: string;
}

/**
 * Contrairement aux autres écritures de cet espace, celle-ci passe par la
 * file locale (comme le kit facilitateur) : traiter un signalement est une
 * action ponctuelle sur une ressource déjà connue, qui mérite de survivre
 * une coupure réseau plutôt que d'échouer sèchement.
 */
export async function updateSignalement(
  id: string,
  input: UpdateSignalementInput
): Promise<void> {
  if (
    (input.statut === "oriente" || input.statut === "clos") &&
    !input.suiteDonnee?.trim()
  ) {
    throw new ApiError(
      "La suite donnée est obligatoire pour orienter ou clore un signalement."
    );
  }
  await enqueuer("superviseur_signalement", "PATCH", `/superviseur/signalements/${id}`, {
    statut: input.statut,
    suite_donnee: input.suiteDonnee ?? null,
  });
}

// --- Campagnes : hors du périmètre de cette étape (portée nationale
// MINPROFF, `Api\Minproff\*`, pas le superviseur d'arrondissement/terrain
// que ce kit sert) — laissées en mémoire locale pour l'instant.
let campagnes = JSON.parse(JSON.stringify(MOCK_CAMPAGNES)) as Campagne[];

export async function getCampagnes(): Promise<Campagne[]> {
  return campagnes;
}

export interface CreerCampagneInput {
  titre: string;
  objet?: string;
  modules: string[];
  langues: string[];
  regions: string[];
  dateDebut: string;
  dateFin: string;
}

export async function createCampagne(input: CreerCampagneInput): Promise<Campagne> {
  const campagne: Campagne = {
    id: `camp-${Date.now()}`,
    titre: input.titre,
    objet: input.objet,
    statut: "planifiee",
    dateDebut: input.dateDebut,
    dateFin: input.dateFin,
    modules: input.modules,
    langues: input.langues,
    regions: input.regions,
    affectations: input.regions.map((region) => ({
      portee: `Région ${region}`,
      recues: 0,
      affectees: 1,
    })),
    jaiPrisConnaissance: true,
  };
  campagnes = [campagne, ...campagnes];
  return campagne;
}

export async function accuserCampagne(id: string): Promise<Campagne> {
  const existante = campagnes.find((c) => c.id === id);
  if (!existante) throw new ApiError("Campagne introuvable.");
  const maj = { ...existante, jaiPrisConnaissance: true };
  campagnes = campagnes.map((c) => (c.id === id ? maj : c));
  return maj;
}
