import * as repo from "@/db/repositories/facilitateur";
import { listerEnAttente } from "@/db/repositories/syncQueue";
import type {
  ActiviteTerrain,
  ActiviteType,
  CohortePaquet,
  CohorteResume,
  DifficulteFonctionnelle,
  EvenementFile,
  FideliteReponse,
  Foyer,
  GroupeSoutien,
  ModuleFormation,
  PresenceStatut,
  Seance,
  SignalementFacilitateur,
  SignalementGraviteFacilitateur,
  TableauDeBordFacilitateur,
  TypeSignalementFacilitateur,
} from "@/types";

/**
 * Toutes ces fonctions lisent et écrivent la base SQLite locale (le
 * "backend" tant que l'appareil est hors-ligne, voir `src/db/`). Chaque
 * écriture de terrain dépose aussi un événement dans la file de
 * synchronisation, que le moteur (`src/services/sync/engine.ts`) rejoue
 * vers l'API Laravel de référence dès que le réseau revient.
 */

export async function getCohortesDisponibles(
  facilitateurId: string
): Promise<CohorteResume[]> {
  const cohorte = await repo.getCohorteDuFacilitateur(facilitateurId);
  if (!cohorte) return [];
  const parents = await repo.getParentsInscrits(cohorte.id);
  return [
    {
      id: cohorte.id,
      libelle: cohorte.libelle,
      parents: parents.length,
      ratioMax: cohorte.ratio_max,
      dateDebut: cohorte.date_debut,
    },
  ];
}

export async function getPaquet(facilitateurId: string): Promise<CohortePaquet | null> {
  return repo.getPaquet(facilitateurId);
}

export async function telechargerCohorte(cohorteId: string): Promise<void> {
  await repo.marquerCohorteTelechargee(cohorteId);
}

export async function demarrerSeance(
  cohorteId: string,
  moduleCode: string
): Promise<Seance> {
  return repo.demarrerSeance(cohorteId, moduleCode);
}

export async function ouvrirSequence(
  seanceId: string,
  sequenceId: string,
  dureeReelleSecondes: number
): Promise<void> {
  return repo.ouvrirSequence(seanceId, sequenceId, dureeReelleSecondes);
}

export async function getPresencesDeLaSeance(
  seanceId: string
): Promise<Record<string, PresenceStatut>> {
  return repo.getPresencesDeLaSeance(seanceId);
}

export async function getSequenceIdsOuvertes(seanceId: string): Promise<string[]> {
  return repo.getSequenceIdsOuvertes(seanceId);
}

export async function pointerPresence(
  seanceId: string,
  parentId: string,
  statut: PresenceStatut
): Promise<void> {
  return repo.pointerPresence(seanceId, parentId, statut);
}

export async function definirRepereLocal(
  parentId: string,
  repere: string
): Promise<void> {
  return repo.definirRepereLocal(parentId, repere);
}

export async function soumettreFidelite(
  seanceId: string,
  reponses: FideliteReponse[],
  commentaireGeneral?: string
): Promise<void> {
  return repo.soumettreFidelite(seanceId, reponses, commentaireGeneral);
}

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
  return repo.inscrireParent(input);
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
  return repo.enregistrerActivite(input);
}

export async function getActivites(facilitateurId: string): Promise<ActiviteTerrain[]> {
  return repo.getActivites(facilitateurId);
}

export async function getFoyers(facilitateurId: string): Promise<Foyer[]> {
  return repo.getFoyers(facilitateurId);
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
  return repo.enregistrerVisite(input);
}

export async function getGroupesSoutien(facilitateurId: string): Promise<GroupeSoutien[]> {
  return repo.getGroupesSoutien(facilitateurId);
}

export async function getSignalements(
  facilitateurId: string
): Promise<SignalementFacilitateur[]> {
  return repo.getSignalements(facilitateurId);
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
  return repo.soumettreSignalement(input);
}

export async function getFormation(facilitateurId: string): Promise<ModuleFormation[]> {
  return repo.getModulesFormation(facilitateurId);
}

export async function marquerSectionLue(
  facilitateurId: string,
  moduleCode: string,
  sectionOrdre: number
): Promise<void> {
  return repo.marquerSectionLue(facilitateurId, moduleCode, sectionOrdre);
}

export async function getTableauDeBord(
  facilitateurId: string
): Promise<TableauDeBordFacilitateur> {
  return repo.getTableauDeBord(facilitateurId);
}

export async function getFileAttente(): Promise<EvenementFile[]> {
  const rows = await listerEnAttente();
  return rows.map((r) => {
    const parsed = JSON.parse(r.payload);
    return {
      uuid: parsed.uuid,
      type: parsed.type,
      seanceUuid: parsed.seance_uuid,
      emisA: parsed.emis_a,
      charge: parsed.charge,
      statut: r.statut === "erreur" ? "erreur" : "en_attente",
    };
  });
}
