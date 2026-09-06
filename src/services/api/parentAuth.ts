import { apiRequest } from "@/services/api/client";

/**
 * `POST /parent/session` sur le serveur de référence (voir
 * `App\Http\Controllers\Api\SessionController::parent`). Session courte,
 * jamais prolongée (`config('mvoe.parent.duree_session_minutes')`) — le
 * jeton expire, il n'y a pas de renouvellement silencieux. Un mineur
 * (`majeur: false`) n'obtient jamais de session (403, orienté vers son
 * facilitateur) : l'appelant doit avoir déjà écarté ce cas.
 */
export interface ConnexionParentEnLigneReponse {
  jeton: string;
  expireA: string | null;
  parent: { codeParent: string; langue: string };
}

export interface ConnexionParentEnLigneInput {
  codeParent: string;
  codeAcces: string;
}

interface ReponseServeur {
  jeton: string;
  expire_a: string | null;
  parent: { code_parent: string; langue: string };
}

export async function connexionParentEnLigne(
  input: ConnexionParentEnLigneInput
): Promise<ConnexionParentEnLigneReponse | null> {
  try {
    const reponse = await apiRequest<ReponseServeur>("/parent/session", {
      method: "POST",
      body: {
        code_parent: input.codeParent,
        code_acces: input.codeAcces,
        majeur: true,
      },
    });
    return {
      jeton: reponse.jeton,
      expireA: reponse.expire_a,
      parent: { codeParent: reponse.parent.code_parent, langue: reponse.parent.langue },
    };
  } catch {
    // Hors-ligne, ou identifiants qui n'existent pas côté serveur : on laisse
    // l'appelant retomber sur le verdict du login local.
    return null;
  }
}
