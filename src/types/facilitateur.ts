export interface FacilitateurCompte {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  arrondissementNom: string;
}

export interface CohorteResume {
  id: string;
  libelle: string;
  parents: number;
  ratioMax: number;
  dateDebut: string;
}

export type SequenceType = "brise_glace" | "unite" | "echange" | "cloture";

export interface SequenceUnite {
  code: string;
  messageCle: string;
  languesDisponibles: string[];
  audioParLangue: Record<string, string | undefined>;
  texteParLangue: Record<string, string | undefined>;
  pictogrammes?: string[];
}

export interface Sequence {
  id: string;
  ordre: number;
  titre: string;
  type: SequenceType;
  dureeMinutes: number;
  unite?: SequenceUnite;
}

export type SeanceStatut = "a_venir" | "en_cours" | "terminee";

export interface Seance {
  id: string;
  moduleCode: string;
  moduleTitre: string;
  statut: SeanceStatut;
  sequenceEnCoursId?: string;
  demarreeLe?: string;
  termineeLe?: string;
  sequences: Sequence[];
}

export type PresenceStatut =
  | "a_pointer"
  | "present"
  | "absent"
  | "rattrape_binome";

export interface ParentInscrit {
  id: string;
  codeParent: string;
  repereLocal?: string;
  presence: PresenceStatut;
}

export interface FideliteReponse {
  sequenceId: string;
  realisee: boolean;
  qualite?: "difficile" | "correcte" | "bien_passee";
  commentaire?: string;
}

export type ActiviteType =
  | "causerie"
  | "atelier"
  | "porte_a_porte"
  | "reunion_groupe";

export interface ActiviteTerrain {
  id: string;
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

export interface Foyer {
  id: string;
  localite: string;
  adultes: number;
  enfants: number;
  difficultesFonctionnelles: string[];
  dejaParticipeProgramme: boolean;
}

export interface Visite {
  id: string;
  foyerId: string;
  date: string;
  observations: string[];
  suiviPrevu: boolean;
}

export interface GroupeSoutien {
  id: string;
  nom: string;
  actif: boolean;
  derniereReunion?: string;
}

export type SignalementGraviteFacilitateur = "faible" | "moderee" | "grave";

export interface SignalementFacilitateur {
  id: string;
  type: string;
  gravite: SignalementGraviteFacilitateur;
  soumisLe: string;
  statut: "soumis" | "examine" | "oriente" | "clos";
  joursAttente: number;
}

export interface SectionFormation {
  id: string;
  titre: string;
  dureeMinutes: number;
  corps: string;
  fichierAudio?: string;
  lue: boolean;
}

export interface ModuleFormation {
  code: string;
  titre: string;
  type: string;
  objectif: string;
  dureeMinutes: number;
  sections: SectionFormation[];
  progression: number;
  termine: boolean;
}

export interface TableauDeBordFacilitateur {
  cohortes: number;
  parentsInscrits: number;
  seancesTenues: number;
  ecartsReleves: number;
  doseMoyenne: number;
  delaiMoyenRemontee: number;
  activites: number;
  personnesTouchees: number;
  femmes: number;
  hommes: number;
  foyersSuivis: number;
  foyersDifficulteFonctionnelle: number;
  groupesSoutienActifs: number;
  participantsHandicap: number;
  signalementsAttente: number;
}

export type EvenementType =
  | "activite"
  | "visite"
  | "signalement"
  | "presence"
  | "fidelite"
  | "progression_formation"
  | "inscription_parent";

export interface EvenementFile {
  uuid: string;
  type: EvenementType;
  creeLe: string;
  charge: Record<string, unknown>;
  statut: "en_attente" | "synchronise" | "erreur";
}

export interface CohortePaquet {
  cohorte: CohorteResume;
  seances: Seance[];
  parents: ParentInscrit[];
  telechargeLe: string;
}
