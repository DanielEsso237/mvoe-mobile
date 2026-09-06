import { apiRequest } from "@/services/api/client";

/**
 * `POST /facilitateur/session` sur le serveur de référence (voir
 * `App\Http\Controllers\Api\SessionController::facilitateur`). Accepte soit
 * `telephone`+`code_appareil` (le kit sur le terrain), soit `email`+`password`
 * (un poste de la délégation) — mêmes droits, même jeton dans les deux cas.
 *
 * Un échec ici (hors-ligne, ou identifiants qui n'existent pas côté serveur)
 * n'est jamais une erreur fatale pour l'appelant : le login local reste la
 * voie normale, celle-ci n'est qu'un complément pour provisionner un compte
 * réel au premier login en ligne.
 */
export interface ConnexionFacilitateurEnLigneReponse {
  jeton: string;
  expireA: string | null;
  facilitateur: {
    id: number;
    nom: string;
    arrondissement: string;
  };
}

export type ConnexionFacilitateurEnLigneInput =
  | { telephone: string; codeAppareil: string }
  | { email: string; motDePasse: string };

interface ReponseServeur {
  jeton: string;
  expire_a: string | null;
  facilitateur: { id: number; nom: string; arrondissement: string };
}

export async function connexionFacilitateurEnLigne(
  input: ConnexionFacilitateurEnLigneInput
): Promise<ConnexionFacilitateurEnLigneReponse | null> {
  const body =
    "telephone" in input
      ? { telephone: input.telephone, code_appareil: input.codeAppareil }
      : { email: input.email, password: input.motDePasse };

  try {
    const reponse = await apiRequest<ReponseServeur>("/facilitateur/session", {
      method: "POST",
      body,
    });
    return {
      jeton: reponse.jeton,
      expireA: reponse.expire_a,
      facilitateur: reponse.facilitateur,
    };
  } catch {
    // Hors-ligne, ou identifiants qui n'existent pas côté serveur : on laisse
    // l'appelant retomber sur le verdict du login local.
    return null;
  }
}
