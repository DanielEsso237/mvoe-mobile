export interface FacilitateurCompte {
  id: string;
  nom: string;
  telephone?: string;
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

/** Une séquence de curriculum : elle appartient au module, pas à une séance précise. */
export interface Sequence {
  id: string;
  moduleCode: string;
  ordre: number;
  titre: string;
  type: SequenceType;
  dureeMinutes: number;
  unite?: SequenceUnite;
}

export type SeanceStatut = "en_cours" | "terminee";

/**
 * Une séance n'existe localement qu'une fois démarrée : "Démarrer la
 * séance" est l'événement `seance` lui-même, et son UUID devient l'UUID de
 * la séance pour tous les événements suivants (présences, séquences
 * ouvertes, fidélité).
 */
export interface Seance {
  id: string;
  cohorteId: string;
  moduleCode: string;
  moduleTitre: string;
  statut: SeanceStatut;
  demarreeLe: string;
  termineeLe?: string;
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
}

export type QualiteFidelite = "difficile" | "correcte" | "bien_passee";

export interface FideliteReponse {
  sequenceId: string;
  realisee: boolean;
  qualite?: QualiteFidelite;
  commentaire?: string;
}

/**
 * Les valeurs correspondent exactement à `App\Enums\TypeActivite` côté
 * serveur : ce sont elles qui partent telles quelles dans la charge d'un
 * événement `activite`.
 */
export type ActiviteType =
  | "seance_cohorte"
  | "causerie_educative"
  | "atelier_pratique"
  | "porte_a_porte"
  | "visite_domicile"
  | "reunion_gsp"
  | "sensibilisation_publique";

export interface ActiviteTerrain {
  id: string;
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

/** Valeurs alignées sur `App\Enums\DifficulteFonctionnelle`. */
export type DifficulteFonctionnelle =
  | "vision"
  | "audition"
  | "mobilite"
  | "comprehension"
  | "communication";

export interface Foyer {
  id: string;
  localite: string;
  adultes: number;
  enfants: number;
  difficultesFonctionnelles: DifficulteFonctionnelle[];
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
  cohorteId?: string;
  dateCreation: string;
  derniereReunion?: string;
}

/** Valeurs alignées sur `App\Enums\GraviteSignalement`. */
export type SignalementGraviteFacilitateur = "faible" | "moyenne" | "elevee";

/** Valeurs alignées sur `App\Enums\TypeSignalement`. */
export type TypeSignalementFacilitateur =
  | "maltraitance"
  | "vbg"
  | "mariage_precoce"
  | "negligence"
  | "autre";

export interface SignalementFacilitateur {
  id: string;
  type: TypeSignalementFacilitateur;
  gravite: SignalementGraviteFacilitateur;
  activiteId?: string;
  soumisLe: string;
  statut: "soumis" | "examine" | "oriente" | "clos";
  joursAttente: number;
}

export interface SectionFormation {
  id: string;
  moduleCode: string;
  ordre: number;
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

/**
 * Exactement `ReceptionEvenements::TYPES` côté serveur : c'est cette liste,
 * et aucune autre, que l'API accepte dans le champ `type` d'un événement.
 */
export type EvenementType =
  | "seance"
  | "presence"
  | "sequence_ouverte"
  | "fiche_fidelite"
  | "bilan_seance"
  | "inscription_parent"
  | "activite"
  | "groupe_soutien"
  | "foyer"
  | "visite"
  | "signalement"
  | "progression_formation";

export interface EvenementFile {
  uuid: string;
  type: EvenementType;
  seanceUuid: string | null;
  emisA: string;
  charge: Record<string, unknown>;
  statut: "en_attente" | "synchronise" | "erreur";
}

export interface CohortePaquet {
  cohorte: CohorteResume;
  seanceEnCours: Seance | null;
  sequencesModuleEnCours: Sequence[];
  parents: ParentInscrit[];
  telechargeLe: string;
}
