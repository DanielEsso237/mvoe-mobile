import {
  MOCK_CAMPAGNES,
  MOCK_COHORTES,
  MOCK_FACILITATEURS,
  MOCK_PARAMETRES_COHORTES,
  MOCK_RAPPORT,
  MOCK_SIGNALEMENTS,
  MOCK_TABLEAU_DE_BORD,
} from "@/mocks/superviseur";
import type {
  Campagne,
  Cohorte,
  Facilitateur,
  IdentifiantsFacilitateur,
  ParametreCohorte,
  Rapport,
  Signalement,
  SignalementStatut,
  TableauDeBordIndicateurs,
  TypeJuridique,
} from "@/types";
import { TYPES_JURIDIQUES } from "@/types";
import { ApiError, delay } from "./client";

// État en mémoire, initialisé depuis les mocks : permet de simuler des
// écritures (créer, modifier) tant qu'il n'y a pas de vrai backend.
let facilitateurs = clone(MOCK_FACILITATEURS);
let cohortes = clone(MOCK_COHORTES);
let signalements = clone(MOCK_SIGNALEMENTS);
let campagnes = clone(MOCK_CAMPAGNES);
let parametresCohortes = clone(MOCK_PARAMETRES_COHORTES);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getTableauDeBord(): Promise<TableauDeBordIndicateurs> {
  return delay(MOCK_TABLEAU_DE_BORD);
}

export async function getRegistre(arrondissementId?: string): Promise<Facilitateur[]> {
  const liste = arrondissementId
    ? facilitateurs.filter((f) => f.arrondissementId === arrondissementId)
    : facilitateurs;
  return delay(liste);
}

export async function getTypesJuridiques(): Promise<
  { value: TypeJuridique; label: string }[]
> {
  return delay(TYPES_JURIDIQUES);
}

export interface EnregistrerFacilitateurInput {
  nom: string;
  telephone: string;
  email?: string;
  typeJuridique: TypeJuridique;
  dateFormationInitiale: string;
  organisationRattachement?: string;
  arrondissementId: string;
  arrondissementNom: string;
  departementNom: string;
}

function genererIdentifiants(telephone: string, email?: string): IdentifiantsFacilitateur {
  const codeAppareil = String(Math.floor(100000 + Math.random() * 900000));
  const motDePasse = Math.random().toString(36).slice(2, 10);
  return { telephone, codeAppareil, email, motDePasse };
}

export async function enregistrerFacilitateur(
  input: EnregistrerFacilitateurInput
): Promise<{ facilitateur: Facilitateur; identifiants: IdentifiantsFacilitateur }> {
  if (facilitateurs.some((f) => f.telephone === input.telephone)) {
    return delay(null, 300).then(() => {
      throw new ApiError("Ce numéro de téléphone est déjà enregistré.");
    });
  }

  const facilitateur: Facilitateur = {
    id: `fac-${Date.now()}`,
    nom: input.nom,
    telephone: input.telephone,
    email: input.email,
    typeJuridique: input.typeJuridique,
    organisationRattachement: input.organisationRattachement,
    arrondissementId: input.arrondissementId,
    arrondissementNom: input.arrondissementNom,
    departementNom: input.departementNom,
    dateFormationInitiale: input.dateFormationInitiale,
    derniereActivite: null,
    seancesAnimees: 0,
    modulesTermines: 0,
    modulesDiffusables: 5,
    modulesEnCours: 0,
    statut: "jamais_actif",
  };
  facilitateurs = [...facilitateurs, facilitateur];

  const identifiants = genererIdentifiants(input.telephone, input.email);
  return delay({ facilitateur, identifiants }, 400);
}

export async function regenererIdentifiants(
  facilitateurId: string
): Promise<IdentifiantsFacilitateur> {
  const facilitateur = facilitateurs.find((f) => f.id === facilitateurId);
  if (!facilitateur) {
    return delay(null, 300).then(() => {
      throw new ApiError("Facilitateur introuvable.");
    });
  }
  return delay(genererIdentifiants(facilitateur.telephone, facilitateur.email), 350);
}

export async function getCohortes(): Promise<Cohorte[]> {
  return delay(cohortes);
}

export async function getRapport(annee: number, trimestre: 1 | 2 | 3 | 4): Promise<Rapport> {
  // Un seul jeu de données mocké : on le renvoie avec l'année/trimestre demandés
  // pour que l'écran reflète bien le filtre choisi.
  return delay({ ...MOCK_RAPPORT, annee, trimestre });
}

export async function getSignalements(): Promise<Signalement[]> {
  return delay(signalements);
}

export interface UpdateSignalementInput {
  statut: SignalementStatut;
  suiteDonnee?: string;
}

export async function updateSignalement(
  id: string,
  input: UpdateSignalementInput
): Promise<Signalement> {
  const existant = signalements.find((s) => s.id === id);
  if (!existant) {
    return delay(null, 300).then(() => {
      throw new ApiError("Signalement introuvable.");
    });
  }
  if (
    (input.statut === "oriente" || input.statut === "clos") &&
    !input.suiteDonnee?.trim()
  ) {
    return delay(null, 300).then(() => {
      throw new ApiError(
        "La suite donnée est obligatoire pour orienter ou clore un signalement."
      );
    });
  }

  const maj: Signalement = {
    ...existant,
    statut: input.statut,
    suiteDonnee: input.suiteDonnee ?? existant.suiteDonnee,
    joursAttente: input.statut === "soumis" ? existant.joursAttente : 0,
  };
  signalements = signalements.map((s) => (s.id === id ? maj : s));
  return delay(maj, 350);
}

export async function getCampagnes(): Promise<Campagne[]> {
  return delay(campagnes);
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
  return delay(campagne, 400);
}

export async function accuserCampagne(id: string): Promise<Campagne> {
  const existante = campagnes.find((c) => c.id === id);
  if (!existante) {
    return delay(null, 300).then(() => {
      throw new ApiError("Campagne introuvable.");
    });
  }
  const maj = { ...existante, jaiPrisConnaissance: true };
  campagnes = campagnes.map((c) => (c.id === id ? maj : c));
  return delay(maj, 300);
}

export async function updateParametreCohorte(
  cohorteId: string,
  ratioMax: number
): Promise<ParametreCohorte> {
  const existant = parametresCohortes.find((p) => p.cohorteId === cohorteId);
  if (!existant) {
    return delay(null, 300).then(() => {
      throw new ApiError("Cohorte introuvable.");
    });
  }
  const maj = { ...existant, ratioMax };
  parametresCohortes = parametresCohortes.map((p) =>
    p.cohorteId === cohorteId ? maj : p
  );
  return delay(maj, 300);
}
