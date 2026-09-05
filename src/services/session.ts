import { MOCK_FACILITATEUR_COMPTE } from "@/mocks/facilitateur";
import { MOCK_PARENT_PROGRAMME } from "@/mocks/parent";
import {
  MOCK_SUPERVISEUR_COMPTE,
  MOCK_SUPERVISEUR_COMPTE_NATIONAL,
} from "@/mocks/superviseur";
import type { FacilitateurSession, ParentSession, SuperviseurSession } from "@/types";
import { ApiError, delay } from "./client";

/**
 * Identifiants de démonstration, en dur, tant qu'il n'y a pas de vrai
 * backend. Ce sont ceux que l'appli affichera dans les écrans de connexion
 * pour permettre de tester chaque espace.
 */
export const DEMO_CREDENTIALS = {
  facilitateurTelephone: "699112233",
  facilitateurCodeAppareil: "123456",
  facilitateurEmail: "marie.ateba@minproff.cm",
  facilitateurMotDePasse: "demo1234",
  superviseurEmail: "paul.nkolo@minproff.cm",
  superviseurMotDePasse: "demo1234",
  superviseurNationalEmail: "direction@minproff.cm",
  superviseurNationalMotDePasse: "demo1234",
  parentCodeParent: "EB2-01",
  parentCodeAcces: "1234",
} as const;

function normaliserTelephone(telephone: string): string {
  return telephone.replace(/\s+/g, "");
}

export interface LoginFacilitateurParTelephoneInput {
  telephone: string;
  codeAppareil: string;
}

export interface LoginFacilitateurParEmailInput {
  email: string;
  motDePasse: string;
}

export type LoginFacilitateurInput =
  | LoginFacilitateurParTelephoneInput
  | LoginFacilitateurParEmailInput;

export async function loginFacilitateur(
  input: LoginFacilitateurInput
): Promise<FacilitateurSession> {
  const valide =
    "telephone" in input
      ? normaliserTelephone(input.telephone) ===
          DEMO_CREDENTIALS.facilitateurTelephone &&
        input.codeAppareil === DEMO_CREDENTIALS.facilitateurCodeAppareil
      : input.email === DEMO_CREDENTIALS.facilitateurEmail &&
        input.motDePasse === DEMO_CREDENTIALS.facilitateurMotDePasse;

  if (!valide) {
    return delay(null, 350).then(() => {
      throw new ApiError("Identifiants incorrects.");
    });
  }

  return delay(
    {
      token: `mock-facilitateur-token-${MOCK_FACILITATEUR_COMPTE.id}`,
      compte: MOCK_FACILITATEUR_COMPTE,
    },
    350
  );
}

export interface LoginSuperviseurInput {
  email: string;
  motDePasse: string;
}

export async function loginSuperviseur(
  input: LoginSuperviseurInput
): Promise<SuperviseurSession> {
  if (
    input.email === DEMO_CREDENTIALS.superviseurNationalEmail &&
    input.motDePasse === DEMO_CREDENTIALS.superviseurNationalMotDePasse
  ) {
    return delay(
      {
        token: `mock-superviseur-token-${MOCK_SUPERVISEUR_COMPTE_NATIONAL.id}`,
        compte: MOCK_SUPERVISEUR_COMPTE_NATIONAL,
      },
      350
    );
  }

  const valide =
    input.email === DEMO_CREDENTIALS.superviseurEmail &&
    input.motDePasse === DEMO_CREDENTIALS.superviseurMotDePasse;

  if (!valide) {
    return delay(null, 350).then(() => {
      throw new ApiError("Identifiants incorrects.");
    });
  }

  return delay(
    {
      token: `mock-superviseur-token-${MOCK_SUPERVISEUR_COMPTE.id}`,
      compte: MOCK_SUPERVISEUR_COMPTE,
    },
    350
  );
}

export interface LoginParentInput {
  codeParent: string;
  codeAcces: string;
  majeur: boolean;
  langue: string;
}

/**
 * Un mineur n'obtient jamais de session : le serveur web refuse même de
 * chercher le code dans ce cas. On reproduit la même règle ici.
 */
export async function loginParent(
  input: LoginParentInput
): Promise<ParentSession> {
  if (!input.majeur) {
    return delay(null, 300).then(() => {
      throw new ApiError("mineur");
    });
  }

  const valide =
    input.codeParent.trim().toUpperCase() ===
      DEMO_CREDENTIALS.parentCodeParent &&
    input.codeAcces === DEMO_CREDENTIALS.parentCodeAcces;

  if (!valide) {
    return delay(null, 350).then(() => {
      throw new ApiError("Code parent ou code d'accès incorrect.");
    });
  }

  return delay(
    {
      token: `mock-parent-token-${MOCK_PARENT_PROGRAMME.id}`,
      langue: input.langue,
      programme: MOCK_PARENT_PROGRAMME,
    },
    350
  );
}

export function creerSessionParentAnonyme(langue: string): ParentSession {
  return { token: null, langue };
}
