import {
  MOCK_ASSISTANT_REPONSE_INTROUVABLE,
  MOCK_ASSISTANT_REPONSES,
  MOCK_FEUILLETON,
  MOCK_MODULES_CATALOGUE,
  MOCK_QUESTIONS_SEMAINE,
  MOCK_SITUATIONS_FREQUENTES,
  MOCK_UNITES_PAR_MODULE,
  MOCK_UNITE_DETAIL,
} from "@/mocks/parent";
import { MOCK_ANNUAIRE, MOCK_ARRONDISSEMENTS, MOCK_LANGUES } from "@/mocks/common";
import type {
  Arrondissement,
  AssistantReponse,
  FacilitateurAnnuaireEntry,
  Feuilleton,
  Langue,
  Modalite,
  ModuleCatalogue,
  QuestionSemaine,
  SituationFrequente,
  UniteDetail,
  UniteResume,
} from "@/types";
import { delay } from "./client";

export async function getLangues(): Promise<Langue[]> {
  return delay(MOCK_LANGUES);
}

export async function getModules(): Promise<ModuleCatalogue[]> {
  return delay(MOCK_MODULES_CATALOGUE);
}

export async function getUnites(moduleNumero: number): Promise<UniteResume[]> {
  return delay(MOCK_UNITES_PAR_MODULE[moduleNumero] ?? []);
}

export async function getUnite(
  uniteId: string,
  modalite: Modalite
): Promise<UniteDetail | undefined> {
  const unite = MOCK_UNITE_DETAIL[uniteId];
  if (!unite) return delay(undefined);
  // Si la modalité demandée n'existe pas pour cette unité, on renvoie quand
  // même l'unité : c'est à l'écran d'annoncer clairement le repli, jamais de
  // substituer silencieusement.
  return delay({ ...unite, modalitesDisponibles: unite.modalitesDisponibles });
}

export async function getFeuilletons(): Promise<Feuilleton> {
  return delay(MOCK_FEUILLETON);
}

export async function getQuestions(): Promise<QuestionSemaine[]> {
  return delay(MOCK_QUESTIONS_SEMAINE);
}

const reponsesAgregees = new Map<string, Map<string, number>>();

export async function repondreQuestion(
  questionId: string,
  optionId: string
): Promise<void> {
  const parOption = reponsesAgregees.get(questionId) ?? new Map<string, number>();
  parOption.set(optionId, (parOption.get(optionId) ?? 0) + 1);
  reponsesAgregees.set(questionId, parOption);
  return delay(undefined, 250);
}

export async function getSituations(): Promise<SituationFrequente[]> {
  return delay(MOCK_SITUATIONS_FREQUENTES);
}

export interface PoserAssistantInput {
  situationId?: string;
  texte?: string;
}

export async function poserAssistant(
  input: PoserAssistantInput
): Promise<AssistantReponse> {
  const reponse = input.situationId
    ? MOCK_ASSISTANT_REPONSES[input.situationId]
    : undefined;
  return delay(reponse ?? MOCK_ASSISTANT_REPONSE_INTROUVABLE, 500);
}

export async function getArrondissements(): Promise<Arrondissement[]> {
  return delay(MOCK_ARRONDISSEMENTS);
}

export async function getAnnuaire(
  arrondissementId?: string
): Promise<FacilitateurAnnuaireEntry[]> {
  const liste = arrondissementId
    ? MOCK_ANNUAIRE.filter((f) => f.arrondissementId === arrondissementId)
    : MOCK_ANNUAIRE;
  return delay(liste);
}
