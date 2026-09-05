import {
  MOCK_ACTIVITES_TERRAIN,
  MOCK_COHORTES_DISPONIBLES,
  MOCK_FOYERS,
  MOCK_GROUPES_SOUTIEN,
  MOCK_MODULES_FORMATION,
  MOCK_PAQUET,
  MOCK_SIGNALEMENTS_FACILITATEUR,
  MOCK_TABLEAU_DE_BORD_FACILITATEUR,
} from "@/mocks/facilitateur";
import type {
  ActiviteTerrain,
  CohortePaquet,
  CohorteResume,
  EvenementFile,
  EvenementType,
  FideliteReponse,
  Foyer,
  GroupeSoutien,
  ModuleFormation,
  ParentInscrit,
  PresenceStatut,
  SignalementFacilitateur,
  SignalementGraviteFacilitateur,
  TableauDeBordFacilitateur,
  Visite,
} from "@/types";
import { delay } from "./client";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

let paquet: CohortePaquet | null = null;
let activites = clone(MOCK_ACTIVITES_TERRAIN);
let foyers = clone(MOCK_FOYERS);
let visites: Visite[] = [];
let groupesSoutien = clone(MOCK_GROUPES_SOUTIEN);
let signalements = clone(MOCK_SIGNALEMENTS_FACILITATEUR);
let modulesFormation = clone(MOCK_MODULES_FORMATION);

/**
 * Le déroulé fonctionne "hors-ligne d'abord" : chaque écriture de terrain
 * (activité, visite, signalement, présence, fidélité, progression) est
 * d'abord ajoutée à cette file locale, puis "synchronisée" (ici simulée,
 * faute de backend). Le compteur de synchro de l'UI se base dessus.
 */
let fileAttente: EvenementFile[] = [];

export function getFileAttente(): EvenementFile[] {
  return clone(fileAttente);
}

function enqueuer(type: EvenementType, charge: Record<string, unknown>) {
  const evenement: EvenementFile = {
    uuid: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    creeLe: new Date().toISOString(),
    charge,
    statut: "en_attente",
  };
  fileAttente = [...fileAttente, evenement];
  // Simule la réconciliation en arrière-plan : sans vrai réseau, on
  // "synchronise" après un court délai plutôt qu'instantanément, pour que
  // le compteur reste visible un instant (comme sur le terrain).
  setTimeout(() => {
    fileAttente = fileAttente.map((e) =>
      e.uuid === evenement.uuid ? { ...e, statut: "synchronise" } : e
    );
  }, 1500);
}

export async function getCohortesDisponibles(): Promise<CohorteResume[]> {
  return delay(MOCK_COHORTES_DISPONIBLES);
}

export async function getPaquet(cohorteId: string): Promise<CohortePaquet> {
  if (!paquet) {
    paquet = clone(MOCK_PAQUET);
  }
  return delay(paquet);
}

export function getPaquetActuel(): CohortePaquet | null {
  return paquet ? clone(paquet) : null;
}

export async function pointerPresence(
  parentId: string,
  statut: PresenceStatut
): Promise<ParentInscrit[]> {
  if (!paquet) throw new Error("Aucun paquet téléchargé.");
  paquet = {
    ...paquet,
    parents: paquet.parents.map((p) =>
      p.id === parentId ? { ...p, presence: statut } : p
    ),
  };
  enqueuer("presence", { parentId, statut });
  return delay(paquet.parents);
}

export async function definirRepereLocal(
  parentId: string,
  repere: string
): Promise<ParentInscrit[]> {
  if (!paquet) throw new Error("Aucun paquet téléchargé.");
  // Un repère est une note privée à l'appareil : jamais mise en file, jamais
  // synchronisée.
  paquet = {
    ...paquet,
    parents: paquet.parents.map((p) =>
      p.id === parentId ? { ...p, repereLocal: repere } : p
    ),
  };
  return delay(paquet.parents, 150);
}

export async function soumettreFidelite(
  seanceId: string,
  reponses: FideliteReponse[]
): Promise<void> {
  enqueuer("fidelite", { seanceId, reponses });
  return delay(undefined, 300);
}

export interface InscrireParentInput {
  langue: string;
  situation: "union" | "seul" | "non_renseigne";
  revenu: "regulier" | "irregulier" | "aucun" | "non_renseigne";
  telephonePartage: boolean;
  repereLocal?: string;
}

export async function inscrireParent(
  input: InscrireParentInput
): Promise<{ codeParent: string; codeAcces: string }> {
  if (!paquet) throw new Error("Aucun paquet téléchargé.");
  const numero = paquet.parents.length + 1;
  const codeParent = `EB2-${String(numero).padStart(2, "0")}`;
  const codeAcces = String(Math.floor(1000 + Math.random() * 9000));

  const nouveauParent: ParentInscrit = {
    id: `p-${Date.now()}`,
    codeParent,
    repereLocal: input.repereLocal,
    presence: "a_pointer",
  };
  paquet = { ...paquet, parents: [...paquet.parents, nouveauParent] };
  enqueuer("inscription_parent", { codeParent, ...input });
  return delay({ codeParent, codeAcces }, 400);
}

export async function enregistrerActivite(
  input: Omit<ActiviteTerrain, "id">
): Promise<ActiviteTerrain> {
  const activite: ActiviteTerrain = { ...input, id: `act-${Date.now()}` };
  activites = [activite, ...activites];
  enqueuer("activite", { ...input });
  return delay(activite, 350);
}

export async function getActivites(): Promise<ActiviteTerrain[]> {
  return delay(activites);
}

export async function getFoyers(): Promise<Foyer[]> {
  return delay(foyers);
}

export interface EnregistrerVisiteInput {
  foyer: Omit<Foyer, "id"> | { foyerId: string };
  date: string;
  observations: string[];
  suiviPrevu: boolean;
}

export async function enregistrerVisite(
  input: EnregistrerVisiteInput
): Promise<Visite> {
  let foyerId: string;
  if ("foyerId" in input.foyer) {
    foyerId = input.foyer.foyerId;
  } else {
    const nouveauFoyer: Foyer = { ...input.foyer, id: `foyer-${Date.now()}` };
    foyers = [nouveauFoyer, ...foyers];
    foyerId = nouveauFoyer.id;
  }

  const visite: Visite = {
    id: `visite-${Date.now()}`,
    foyerId,
    date: input.date,
    observations: input.observations,
    suiviPrevu: input.suiviPrevu,
  };
  visites = [visite, ...visites];
  enqueuer("visite", { ...input, foyerId });
  return delay(visite, 350);
}

export async function getGroupesSoutien(): Promise<GroupeSoutien[]> {
  return delay(groupesSoutien);
}

export async function getSignalements(): Promise<SignalementFacilitateur[]> {
  return delay(signalements);
}

export interface SoumettreSignalementInput {
  type: string;
  gravite: SignalementGraviteFacilitateur;
}

export async function soumettreSignalement(
  input: SoumettreSignalementInput
): Promise<SignalementFacilitateur> {
  const signalement: SignalementFacilitateur = {
    id: `sig-${Date.now()}`,
    type: input.type,
    gravite: input.gravite,
    soumisLe: new Date().toISOString().slice(0, 10),
    statut: "soumis",
    joursAttente: 0,
  };
  signalements = [signalement, ...signalements];
  enqueuer("signalement", { ...input });
  return delay(signalement, 350);
}

export async function getFormation(): Promise<ModuleFormation[]> {
  return delay(modulesFormation);
}

export async function getFormationModule(
  code: string
): Promise<ModuleFormation | undefined> {
  return delay(modulesFormation.find((m) => m.code === code));
}

export async function marquerSectionLue(
  moduleCode: string,
  sectionId: string
): Promise<ModuleFormation | undefined> {
  modulesFormation = modulesFormation.map((m) => {
    if (m.code !== moduleCode) return m;
    const sections = m.sections.map((s) =>
      s.id === sectionId ? { ...s, lue: true } : s
    );
    const progression =
      sections.filter((s) => s.lue).length / sections.length;
    return { ...m, sections, progression, termine: progression === 1 };
  });
  enqueuer("progression_formation", { moduleCode, sectionId });
  const module = modulesFormation.find((m) => m.code === moduleCode);
  return delay(module);
}

export async function getTableauDeBord(): Promise<TableauDeBordFacilitateur> {
  return delay(MOCK_TABLEAU_DE_BORD_FACILITATEUR);
}
