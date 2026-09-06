import NetInfo from "@react-native-community/netinfo";

import { getJetonApiFacilitateurActif } from "@/db/repositories/auth";
import { EVENEMENTS_ENDPOINT } from "@/db/repositories/facilitateur";
import {
  listerEnAttente,
  marquerErreur,
  marquerSynchronise,
  type SyncQueueRow,
} from "@/db/repositories/syncQueue";
import { ApiNetworkError, ApiResponseError, apiRequest } from "@/services/api/client";

const RETRY_INTERVAL_MS = 30000;

let retryTimer: ReturnType<typeof setInterval> | null = null;
let netInfoUnsubscribe: (() => void) | null = null;
let traitementEnCours = false;

interface BilanEvenements {
  acceptes: string[];
  doublons: string[];
  rejetes: { uuid: string; raison: string }[];
}

/**
 * Laravel valide chaque élément du tableau `evenements` avant même que le
 * contrôleur ne s'exécute : UN SEUL item malformé fait échouer le lot
 * entier avec un 422, avant que le serveur n'ait pu accepter les autres.
 * Le corps de la réponse nomme le champ en cause (`evenements.3.type`) —
 * on en tire l'index pour savoir LEQUEL retirer de la file, plutôt que de
 * rejouer indéfiniment un lot qui échouera toujours de la même façon.
 */
function extraireIndexEvenementsFautifs(corpsErreur: string): number[] {
  try {
    const corps = JSON.parse(corpsErreur) as { errors?: Record<string, unknown> };
    const indices = new Set<number>();
    for (const champ of Object.keys(corps.errors ?? {})) {
      const correspondance = champ.match(/^evenements\.(\d+)\./);
      if (correspondance) indices.add(Number(correspondance[1]));
    }
    return Array.from(indices);
  } catch {
    return [];
  }
}

/**
 * Le kit facilitateur remonte sa file en UN SEUL envoi par lot vers
 * `/facilitateur/evenements` (voir `EvenementController::store` côté
 * référence) : le serveur répond, UUID par UUID, ce qu'il a accepté, ce
 * qu'il avait déjà (doublon, donc à vider quand même) et ce qu'il a rejeté.
 */
async function traiterLotEvenements(
  endpoint: string,
  items: SyncQueueRow[]
): Promise<void> {
  const parUuid = new Map<string, SyncQueueRow>();
  const evenements: Record<string, unknown>[] = [];
  for (const item of items) {
    try {
      const parsed = JSON.parse(item.payload) as { uuid?: string };
      if (!parsed.uuid) throw new Error("uuid manquant");
      parUuid.set(parsed.uuid, item);
      evenements.push(parsed);
    } catch {
      // Charge illisible (jamais produite par ce code, mais possible sur un
      // reliquat d'une version antérieure) : on la retire définitivement,
      // la rejouer ne la rendra jamais valide.
      await marquerErreur(item.id, "Charge illisible, retirée de la file.");
    }
  }
  if (evenements.length === 0) return;

  try {
    const jeton = await getJetonApiFacilitateurActif();
    const bilan = await apiRequest<BilanEvenements>(endpoint, {
      method: "POST",
      token: jeton,
      body: { evenements },
    });

    for (const uuid of [...bilan.acceptes, ...bilan.doublons]) {
      const item = parUuid.get(uuid);
      if (item) await marquerSynchronise(item.id);
    }
    for (const rejet of bilan.rejetes ?? []) {
      const item = parUuid.get(rejet.uuid);
      if (item) await marquerErreur(item.id, rejet.raison);
    }
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 422) {
      for (const index of extraireIndexEvenementsFautifs(error.message)) {
        const uuidFautif = evenements[index]?.uuid as string | undefined;
        const itemFautif = uuidFautif ? parUuid.get(uuidFautif) : undefined;
        if (itemFautif) {
          await marquerErreur(itemFautif.id, "Rejeté par le serveur (format invalide).");
        }
      }
    }
    // Hors-ligne, serveur injoignable, ou item fautif non identifiable :
    // rien d'autre n'est marqué, on rejouera le reste au prochain passage.
  }
}

async function traiterUnParUn(items: SyncQueueRow[]): Promise<void> {
  for (const item of items) {
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
      if (error instanceof ApiNetworkError) break;
    }
  }
}

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
    if (enAttente.length === 0) return;

    const parEndpoint = new Map<string, SyncQueueRow[]>();
    for (const item of enAttente) {
      const liste = parEndpoint.get(item.endpoint) ?? [];
      liste.push(item);
      parEndpoint.set(item.endpoint, liste);
    }

    for (const [endpoint, items] of parEndpoint) {
      if (endpoint === EVENEMENTS_ENDPOINT) {
        await traiterLotEvenements(endpoint, items);
      } else {
        await traiterUnParUn(items);
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
