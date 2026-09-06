import {
  creerSession,
  supprimerSession,
  trouverFacilitateurParEmail,
  trouverFacilitateurParTelephone,
  trouverParentParCode,
  trouverSuperviseurParEmail,
  verifierMotDePasse,
} from "@/db/repositories/auth";
import type {
  FacilitateurCompte,
  FacilitateurSession,
  ParentSession,
  SuperviseurCompte,
  SuperviseurSession,
} from "@/types";
import { ApiError } from "./client";

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

/**
 * Toute la validation des identifiants se fait maintenant contre la base
 * SQLite locale (le "backend" tant que l'appareil est hors-ligne), plus
 * jamais contre une constante JS en mémoire.
 */
export async function loginFacilitateur(
  input: LoginFacilitateurInput
): Promise<FacilitateurSession> {
  const row =
    "telephone" in input
      ? await trouverFacilitateurParTelephone(normaliserTelephone(input.telephone))
      : await trouverFacilitateurParEmail(input.email);

  if (!row) {
    throw new ApiError("Identifiants incorrects.");
  }

  const valide =
    "telephone" in input
      ? await verifierMotDePasse(input.codeAppareil, row.code_appareil_hash)
      : await verifierMotDePasse(input.motDePasse, row.mot_de_passe_hash);

  if (!valide) {
    throw new ApiError("Identifiants incorrects.");
  }

  const token = await creerSession("facilitateur", row.id);
  const compte: FacilitateurCompte = {
    id: row.id,
    nom: row.nom,
    telephone: row.telephone,
    email: row.email ?? undefined,
    arrondissementNom: row.arrondissement_nom,
  };

  return { token, compte };
}

export interface LoginSuperviseurInput {
  email: string;
  motDePasse: string;
}

export async function loginSuperviseur(
  input: LoginSuperviseurInput
): Promise<SuperviseurSession> {
  const row = await trouverSuperviseurParEmail(input.email);
  if (!row) {
    throw new ApiError("Identifiants incorrects.");
  }

  const valide = await verifierMotDePasse(input.motDePasse, row.mot_de_passe_hash);
  if (!valide) {
    throw new ApiError("Identifiants incorrects.");
  }

  const token = await creerSession("superviseur", row.id);
  const compte: SuperviseurCompte = {
    id: row.id,
    nom: row.nom,
    email: row.email,
    portee: {
      niveau: row.niveau,
      entiteId: row.entite_id,
      libelle: row.entite_libelle,
    },
  };

  return { token, compte };
}

export interface LoginParentInput {
  codeParent: string;
  codeAcces: string;
  majeur: boolean;
  langue: string;
}

/**
 * Un mineur n'obtient jamais de session : on ne cherche même pas le code
 * dans ce cas, exactement comme le fait le serveur de référence.
 */
export async function loginParent(
  input: LoginParentInput
): Promise<ParentSession> {
  if (!input.majeur) {
    throw new ApiError("mineur");
  }

  const row = await trouverParentParCode(input.codeParent);
  if (!row) {
    throw new ApiError("Code parent ou code d'accès incorrect.");
  }

  const valide = await verifierMotDePasse(input.codeAcces, row.code_acces_hash);
  if (!valide) {
    throw new ApiError("Code parent ou code d'accès incorrect.");
  }

  const token = await creerSession("parent", row.id);

  return {
    token,
    langue: input.langue,
    programme: {
      id: row.id,
      codeParent: row.code_parent,
      langue: row.langue,
      arrondissementId: row.arrondissement_id,
    },
  };
}

export function creerSessionParentAnonyme(langue: string): ParentSession {
  return { token: null, langue };
}

/**
 * Révoque le jeton côté base locale (l'équivalent de `DELETE /session`
 * dans l'API de référence). Un jeton anonyme (parent sans code) n'a rien à
 * révoquer.
 */
export async function logout(token: string | null | undefined): Promise<void> {
  if (!token) return;
  await supprimerSession(token);
}
