import { apiRequest } from "@/services/api/client";

/**
 * `POST /superviseur/session` sur le serveur de référence (voir
 * `App\Http\Controllers\Api\SessionController::superviseur`). Contrairement
 * au facilitateur, un seul couple d'identifiants existe pour ce rôle :
 * `email`+`password`. `portee` y est déjà le libellé (une chaîne), pas un
 * objet — ce n'est que sur les écrans de données (tableau de bord, etc.)
 * que la portée redevient structurée.
 */
export interface ConnexionSuperviseurEnLigneReponse {
  jeton: string;
  expireA: string | null;
  superviseur: {
    nom: string;
    niveau: string;
    portee: string;
  };
}

export interface ConnexionSuperviseurEnLigneInput {
  email: string;
  motDePasse: string;
}

interface ReponseServeur {
  jeton: string;
  expire_a: string | null;
  superviseur: { nom: string; niveau: string; portee: string };
}

export async function connexionSuperviseurEnLigne(
  input: ConnexionSuperviseurEnLigneInput
): Promise<ConnexionSuperviseurEnLigneReponse | null> {
  try {
    const reponse = await apiRequest<ReponseServeur>("/superviseur/session", {
      method: "POST",
      body: { email: input.email, password: input.motDePasse },
    });
    return {
      jeton: reponse.jeton,
      expireA: reponse.expire_a,
      superviseur: reponse.superviseur,
    };
  } catch {
    // Hors-ligne, ou identifiants qui n'existent pas côté serveur : on laisse
    // l'appelant retomber sur le verdict du login local.
    return null;
  }
}
