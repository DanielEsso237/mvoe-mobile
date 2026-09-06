import { useEffect, useState } from "react";

import { getFileAttente } from "@/services/facilitateur";
import type { EvenementFile } from "@/types";

/**
 * Le compteur de synchro lit la file locale en continu (courte fréquence,
 * pas d'abonnement pub/sub côté service) : c'est la même donnée que celle
 * qui déciderait, avec un vrai backend, si un envoi reste en attente.
 */
export function useSyncQueue(): EvenementFile[] {
  const [file, setFile] = useState<EvenementFile[]>([]);

  useEffect(() => {
    let annule = false;

    const rafraichir = () => {
      getFileAttente().then((f) => {
        if (!annule) setFile(f);
      });
    };

    rafraichir();
    const interval = setInterval(rafraichir, 1000);
    return () => {
      annule = true;
      clearInterval(interval);
    };
  }, []);

  return file;
}
