import { apiRequest } from "@/services/api/client";

/**
 * Types calqués sur la forme JSON EXACTE renvoyée par le serveur de
 * référence (`CohorteController::index` et `PaquetCohorte::pour`, voir
 * ../mvoe/app/Http/Controllers/Api/Facilitateur/CohorteController.php et
 * ../mvoe/app/Services/PaquetCohorte.php). Volontairement en snake_case et
 * non retravaillés : la traduction vers nos types locaux se fait dans
 * `src/db/repositories/facilitateur.ts` (`provisionnerCohorteReelle`), pas
 * ici — ce module n'est qu'un miroir fidèle du contrat serveur.
 */
export interface CohorteResumeServeur {
  id: number;
  libelle: string;
  arrondissement: string | null;
  effectif: number;
  ratio_max: number;
  places_restantes: number;
  date_debut: string;
  seances_tenues: number;
  prochaine_seance: {
    module: { id: number; numero: number; titre: string; renseigne: boolean };
    date_estimee: string;
  } | null;
}

export interface RealisationServeur {
  langue: string | null;
  modalite: "audio" | "texte";
  titre: string;
  contenu_texte: string | null;
  fichier_audio: string | null;
  pictogrammes: string[] | null;
}

export interface UniteServeur {
  id: number;
  message_cle: string;
  realisations: RealisationServeur[];
}

export interface SequenceServeur {
  id: number;
  titre: string;
  ordre: number;
  duree_minutes: number;
  type: "unite_digitale" | "consigne_animation";
  consigne: string | null;
  est_brise_glace: boolean;
  unites: UniteServeur[];
}

export interface ModuleServeur {
  id: number;
  numero: number;
  titre: string;
  ordre: number;
  renseigne: boolean;
  duree_totale_minutes: number;
  sequences: SequenceServeur[];
}

export interface ParentPaquetServeur {
  code_parent: string;
  langue: string | null;
  statut_matrimonial: string | null;
  revenu_regularite: string | null;
  telephone_partage: boolean;
}

export interface FoyerPaquetServeur {
  uuid: string;
  localite: string;
  nb_adultes: number;
  nb_enfants: number;
  difficultes: string[] | null;
  deja_suivi_programme: boolean;
}

export interface GroupePaquetServeur {
  uuid: string;
  libelle: string;
  derniere_reunion: string | null;
}

export interface SectionFormationServeur {
  ordre: number;
  titre: string;
  contenu_texte: string;
  duree_minutes: number;
  fichier_audio: string | null;
}

export interface ModuleFormationServeur {
  sections_vues: number[];
  code: string;
  titre: string;
  type: string;
  type_libelle: string;
  objectif: string;
  duree_minutes: number;
  sections: SectionFormationServeur[];
}

export interface PaquetCohorteServeur {
  genere_a: string;
  cohorte: {
    id: number;
    libelle: string;
    arrondissement: string | null;
    ratio_max: number;
    date_debut: string;
    curriculum_version: { id: number; label: string };
  };
  modules: ModuleServeur[];
  parents: ParentPaquetServeur[];
  foyers: FoyerPaquetServeur[];
  groupes_soutien: GroupePaquetServeur[];
  formation: ModuleFormationServeur[];
}

/** `GET /facilitateur/cohortes` — écran d'accueil : ses cohortes réelles. */
export async function listerCohortesEnLigne(
  jeton: string
): Promise<CohorteResumeServeur[]> {
  const reponse = await apiRequest<{ cohortes: CohorteResumeServeur[] }>(
    "/facilitateur/cohortes",
    { method: "GET", token: jeton }
  );
  return reponse.cohortes;
}

/** `GET /facilitateur/cohortes/{id}/paquet` — le paquet complet, une fois. */
export async function telechargerPaquetEnLigne(
  jeton: string,
  cohorteId: number
): Promise<PaquetCohorteServeur> {
  return apiRequest<PaquetCohorteServeur>(
    `/facilitateur/cohortes/${cohorteId}/paquet`,
    { method: "GET", token: jeton }
  );
}
