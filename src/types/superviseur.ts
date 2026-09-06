import type { Portee } from "./common";
import type {
  SignalementGraviteFacilitateur,
  TypeSignalementFacilitateur,
} from "./facilitateur";

/** Valeurs alignées sur `App\Enums\TypeJuridique` côté serveur. */
export type TypeJuridique =
  | "agent_public"
  | "enseignant"
  | "ong"
  | "association_femmes"
  | "groupe_religieux"
  | "relais_communautaire"
  | "vacataire";

export const TYPES_JURIDIQUES: { value: TypeJuridique; label: string }[] = [
  { value: "agent_public", label: "Agent public" },
  { value: "enseignant", label: "Enseignant" },
  { value: "ong", label: "ONG" },
  { value: "association_femmes", label: "Association de femmes" },
  { value: "groupe_religieux", label: "Groupe religieux" },
  { value: "relais_communautaire", label: "Relais communautaire" },
  { value: "vacataire", label: "Vacataire" },
];

export interface SuperviseurCompte {
  id: string;
  nom: string;
  email: string;
  portee: Portee;
}

export interface Facilitateur {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  /**
   * Le registre serveur (`GET /superviseur/facilitateurs`) renvoie déjà le
   * libellé français, pas la valeur brute de l'enum — contrairement à
   * `EnregistrerFacilitateurInput.typeJuridique` (le formulaire de
   * création), qui lui envoie bien la valeur `TypeJuridique`.
   */
  typeJuridique: string;
  organisationRattachement?: string;
  arrondissementId: string;
  arrondissementNom: string;
  departementNom: string;
  dateFormationInitiale: string;
  derniereActivite: string | null;
  seancesAnimees: number;
  modulesTermines: number;
  modulesDiffusables: number;
  modulesEnCours: number;
  statut: "actif" | "inactif" | "jamais_actif";
}

export interface IdentifiantsFacilitateur {
  telephone: string;
  codeAppareil: string;
  email?: string;
  motDePasse: string;
}

export interface Cohorte {
  id: string;
  libelle: string;
  arrondissementId: string;
  arrondissementNom: string;
  effectif: number;
  ratioMax: number;
  seances: number;
  dateDebut: string;
}

export interface DecoupageEntite {
  id: string;
  niveau: "region" | "departement" | "arrondissement" | "facilitateur";
  nom: string;
  cohortes: number;
  parents: number;
  seances: number;
  ecarts: number;
}

export interface TableauDeBordIndicateurs {
  portee: Portee;
  fil: Portee[];
  facilitateursActifs: number;
  facilitateursFormes: number;
  cohortes: number;
  parentsInscrits: number;
  seancesTenues: number;
  seancesParParent: number;
  ecarts: number;
  joursRemontee: number;
  activites: number;
  personnesTouchees: number;
  femmes: number;
  hommes: number;
  foyersSuivis: number;
  foyersDifficulteFonctionnelle: number;
  groupesSoutienActifs: number;
  groupesSoutienTotal: number;
  participantsHandicap: number;
  signalementsAttente: number;
  signalementsTotal: number;
  decoupage: DecoupageEntite[];
}

export type SignalementStatut = "soumis" | "examine" | "oriente" | "clos";
/**
 * Mêmes valeurs que `SignalementGraviteFacilitateur` (`faible|moyenne|elevee`,
 * alignées sur `App\Enums\GraviteSignalement`) : un seul et même signalement
 * traverse les deux espaces, pas de raison d'avoir deux enums différentes.
 */
export type SignalementGravite = SignalementGraviteFacilitateur;

export interface Signalement {
  id: string;
  type: TypeSignalementFacilitateur;
  gravite: SignalementGravite;
  statut: SignalementStatut;
  arrondissementId: string;
  arrondissementNom: string;
  facilitateurNom: string;
  soumisLe: string;
  joursAttente: number;
  suiteDonnee?: string;
}

export interface CampagneAffectation {
  portee: string;
  recues: number;
  affectees: number;
}

export type CampagneStatut = "planifiee" | "en_cours" | "terminee";

export interface Campagne {
  id: string;
  titre: string;
  objet?: string;
  statut: CampagneStatut;
  dateDebut: string;
  dateFin: string;
  modules: string[];
  langues: string[];
  regions: string[];
  affectations: CampagneAffectation[];
  jaiPrisConnaissance: boolean;
}

export interface RapportEcartLigne {
  facilitateurNom: string;
  seances: number;
  sequencesRealisees: number;
  declareesJamaisOuvertes: number;
  ouvertesDeclareesNonFaites: number;
  delaiMoyenRemontee: number;
}

export interface RapportCohorteLigne {
  libelle: string;
  arrondissementNom: string;
  effectif: number;
  ratioMax: number;
  seances: number;
}

export interface Rapport {
  annee: number;
  trimestre: 1 | 2 | 3 | 4;
  portee: Portee;
  etabliLe: string;
  seancesTenues: number;
  cohortesActives: number;
  doseMoyenne: number;
  ecartsTotal: number;
  cohortes: RapportCohorteLigne[];
  ecarts: RapportEcartLigne[];
}

export interface ParametreCohorte {
  cohorteId: string;
  ratioMax: number;
  effectifActuel: number;
}
