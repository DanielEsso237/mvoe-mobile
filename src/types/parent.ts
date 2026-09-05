export interface ParentProgramme {
  id: string;
  codeParent: string;
  langue: string;
  arrondissementId: string;
}

export interface ModuleCatalogue {
  numero: number;
  titre: string;
  unitesCount: number;
  renseigne: boolean;
}

export interface UniteResume {
  id: string;
  moduleNumero: number;
  titre: string;
  langueServie: string;
  languesDisponibles: string[];
}

export type Modalite = "audio" | "texte";

export interface UniteDetail {
  id: string;
  moduleNumero: number;
  titre: string;
  contenuTexte?: string;
  fichierAudio?: string;
  pictogrammes?: string[];
  langueServie: string;
  langueDeRepli: boolean;
  modalitesDisponibles: Modalite[];
}

export interface Episode {
  numero: number;
  titre: string;
  dureeSecondes: number;
  dureeLisible: string;
  fichierAudio: string;
}

export interface Feuilleton {
  titre: string;
  resume: string;
  langue: string;
  langueDeRepli: boolean;
  episodes: Episode[];
}

export interface QuestionOption {
  id: string;
  libelle: string;
  pictogramme?: string;
}

export interface QuestionSemaine {
  id: string;
  enonce: string;
  enonceAudio?: string;
  options: QuestionOption[];
  explication: string;
  reference: string;
}

export interface SituationFrequente {
  id: string;
  libelle: string;
  pictogramme?: string;
  fichierAudio?: string;
}

export interface AssistantReponse {
  trouve: boolean;
  reponse?: string;
  reference?: string;
  texte?: string;
  pictogrammes?: string[];
  fichierAudio?: string;
  langueDeRepli?: boolean;
  contactsFacilitateurs?: {
    nom: string;
    telephone: string;
    arrondissementNom: string;
  }[];
}
