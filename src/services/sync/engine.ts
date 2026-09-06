import NetInfo from "@react-native-community/netinfo";

import {
  listerEnAttente,
  marquerErreur,
  marquerSynchronise,
} from "@/db/repositories/syncQueue";
import { apiRequest } from "@/services/api/client";

const RETRY_INTERVAL_MS = 30000;

let retryTimer: ReturnType<typeof setInterval> | null = null;
let netInfoUnsubscribe: (() => void) | null = null;
let traitementEnCours = false;

/**
 * Rejoue la file dans l'ordre : écrit-local-d'abord, envoie-plus-tard.
 * Un échec réseau est silencieux (l'avion en mode avion est un
 * fonctionnement normal, pas une erreur) — seule une vraie réponse du
 * serveur fait avancer ou échouer une ligne.
 */
export async function traiterFileSynchronisation(): Promise<void> {
  if (traitementEnCours) return;
  traitementEnCours = true;
  try {
    const enAttente = await listerEnAttente();
    for (const item of enAttente) {
      try {
        await apiRequest(item.endpoint, {
          method: item.method,
          body: JSON.parse(item.payload),
        });
        await marquerSynchronise(item.id);
      } catch (error) {
        await marquerErreur(
          item.id,
          error instanceof Error ? error.message : "Erreur inconnue."
        );
        // Une erreur réseau arrête la tentative pour cette passe : pas la
        // peine d'essayer les suivantes tant que la connexion ne revient pas.
        if (error instanceof Error && error.name === "ApiNetworkError") break;
      }
    }
  } finally {
    traitementEnCours = false;
  }
}

export function demarrerMoteurSynchronisation(): void {
  if (netInfoUnsubscribe) return; // déjà démarré

  netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      traiterFileSynchronisation();
    }
  });

  retryTimer = setInterval(() => {
    traiterFileSynchronisation();
  }, RETRY_INTERVAL_MS);
}

export function arreterMoteurSynchronisation(): void {
  netInfoUnsubscribe?.();
  netInfoUnsubscribe = null;
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}
