import { apiRequest } from "@/services/api/client";

/**
 * Types calqués sur la forme JSON EXACTE renvoyée par le serveur de
 * référence (`CatalogueController`, `FeuilletonController`,
 * `QuestionController`, `AssistantController`, voir ../mvoe/routes/api.php,
 * groupe `prefix('parent')`). Presque toutes ces routes sont PUBLIQUES —
 * aucun jeton requis, contrairement au facilitateur et au superviseur :
 * seule `POST questions/{id}/reponse` exige un compte ouvert.
 */

export interface LangueServeur {
  code: string;
  libelle: string;
  nom: string;
}

export async function getLanguesEnLigne(): Promise<LangueServeur[]> {
  const reponse = await apiRequest<{ langues: LangueServeur[] }>("/langues", {
    method: "GET",
  });
  return reponse.langues;
}

export interface ModuleCatalogueServeur {
  id: number;
  numero: number;
  titre: string;
  unites: number;
  renseigne: boolean;
}

export async function getModulesEnLigne(): Promise<ModuleCatalogueServeur[]> {
  const reponse = await apiRequest<{ modules: ModuleCatalogueServeur[] }>(
    "/parent/modules",
    { method: "GET" }
  );
  return reponse.modules;
}

export interface UniteResumeServeur {
  id: number;
  titre: string;
  sequence: { ordre: number; titre: string };
  audio_disponible: boolean;
  langue_servie: LangueServeur;
}

export interface UnitesModuleServeur {
  module: { id: number; numero: number; titre: string };
  langue: LangueServeur;
  langues_disponibles: LangueServeur[];
  unites: UniteResumeServeur[];
}

export async function getUnitesEnLigne(
  moduleId: number,
  langue: string
): Promise<UnitesModuleServeur> {
  return apiRequest<UnitesModuleServeur>(
    `/parent/modules/${moduleId}/unites?langue=${encodeURIComponent(langue)}`,
    { method: "GET" }
  );
}

/** Le serveur ne connaît que ces deux modalités (`App\Enums\Modalite`) — pas "texte" tout court. */
export type ModaliteServeur = "audio" | "texte_picto";

export interface UniteDetailServeur {
  id: number;
  message_cle: string;
  reference: string;
  langue_demandee: LangueServeur;
  langue_servie: LangueServeur;
  langue_de_repli: boolean;
  langues_disponibles: LangueServeur[];
  modalite: ModaliteServeur;
  realisation: {
    titre: string;
    contenu_texte: string | null;
    fichier_audio: string | null;
    audio_disponible: boolean;
    pictogrammes: string[] | null;
  } | null;
  modalites_disponibles: ModaliteServeur[];
}

export async function getUniteEnLigne(
  uniteId: number,
  langue: string,
  modalite: ModaliteServeur
): Promise<UniteDetailServeur> {
  return apiRequest<UniteDetailServeur>(
    `/parent/unites/${uniteId}?langue=${encodeURIComponent(langue)}&modalite=${modalite}`,
    { method: "GET" }
  );
}

export interface EpisodeServeur {
  id: number;
  numero: number;
  titre: string;
  duree_secondes: number;
  duree_lisible: string;
  fichier_audio: string;
  unite_id: number | null;
}

export interface FeuilletonServeur {
  id: number;
  titre: string;
  langue: string;
  resume: string;
  episodes: EpisodeServeur[];
}

export async function getFeuilletonsEnLigne(langue: string): Promise<{
  langueDeRepli: boolean;
  feuilletons: FeuilletonServeur[];
}> {
  const reponse = await apiRequest<{
    langue_demandee: LangueServeur;
    langue_de_repli: boolean;
    langues_disponibles: LangueServeur[];
    feuilletons: FeuilletonServeur[];
  }>(`/parent/feuilletons?langue=${encodeURIComponent(langue)}`, { method: "GET" });
  return { langueDeRepli: reponse.langue_de_repli, feuilletons: reponse.feuilletons };
}

export interface QuestionOptionServeur {
  id: number;
  libelle: string;
  pictogramme: string | null;
}

export interface QuestionServeur {
  id: number;
  enonce: string;
  enonce_audio: string | null;
  explication: string;
  reference: string;
  options: QuestionOptionServeur[];
}

export async function getQuestionsEnLigne(): Promise<QuestionServeur[]> {
  const reponse = await apiRequest<{ questions: QuestionServeur[] }>(
    "/parent/questions",
    { method: "GET" }
  );
  return reponse.questions;
}

/** Exige un compte ouvert (`auth:sanctum`, `abilities:parent`) — la seule route parent dans ce cas. */
export async function repondreQuestionEnLigne(
  jeton: string,
  questionId: number,
  optionId: number
): Promise<{ questionId: number; explication: string; reference: string }> {
  const reponse = await apiRequest<{
    question_id: number;
    explication: string;
    reference: string;
  }>(`/parent/questions/${questionId}/reponse`, {
    method: "POST",
    token: jeton,
    body: { option_id: optionId },
  });
  return {
    questionId: reponse.question_id,
    explication: reponse.explication,
    reference: reponse.reference,
  };
}

export interface SituationServeur {
  id: number;
  libelle: string;
  pictogramme: string | null;
  fichier_audio: string | null;
}

export async function getSituationsEnLigne(langue: string): Promise<SituationServeur[]> {
  const reponse = await apiRequest<{ situations: SituationServeur[] }>(
    `/parent/situations?langue=${encodeURIComponent(langue)}`,
    { method: "GET" }
  );
  return reponse.situations;
}

export interface AssistantTrouveServeur {
  trouve: true;
  score: number;
  seuil: number;
  reponse: string;
  reference: string;
  module: { numero: number; titre: string } | null;
  texte: string | null;
  pictogrammes: string[] | null;
  fichier_audio: string | null;
}

export interface AssistantIntrouvableServeur {
  trouve: false;
  score: number;
  seuil: number;
  message: string;
  contacts: { nom: string; telephone: string; arrondissement: string }[];
}

export type AssistantReponseServeur = AssistantTrouveServeur | AssistantIntrouvableServeur;

export interface PoserAssistantInput {
  texte?: string;
  situationId?: number;
  langue?: string;
  arrondissement?: string;
}

/** Correspondance texte déterministe côté serveur (scoring + seuil) — jamais un appel à une IA externe. */
export async function poserAssistantEnLigne(
  input: PoserAssistantInput
): Promise<AssistantReponseServeur> {
  return apiRequest<AssistantReponseServeur>("/parent/assistant", {
    method: "POST",
    body: {
      texte: input.texte,
      situation_id: input.situationId,
      langue: input.langue,
      arrondissement_id: input.arrondissement,
    },
  });
}

export async function getArrondissementsEnLigne(): Promise<string[]> {
  const reponse = await apiRequest<{ arrondissements: string[] }>("/arrondissements", {
    method: "GET",
  });
  return reponse.arrondissements;
}

export interface ContactAnnuaireServeur {
  nom: string;
  telephone: string;
  arrondissement: string;
}

export async function getAnnuaireEnLigne(arrondissement: string): Promise<{
  repliDepartement: boolean;
  message: string | null;
  contacts: ContactAnnuaireServeur[];
}> {
  const reponse = await apiRequest<{
    arrondissement: string;
    repli_departement: boolean;
    message: string | null;
    contacts: ContactAnnuaireServeur[];
  }>(`/annuaire?arrondissement=${encodeURIComponent(arrondissement)}`, { method: "GET" });
  return {
    repliDepartement: reponse.repli_departement,
    message: reponse.message,
    contacts: reponse.contacts,
  };
}
