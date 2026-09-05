import { useEffect, useState } from "react";

import { getFileAttente } from "@/services/facilitateur";
import type { EvenementFile } from "@/types";

/**
 * Le compteur de synchro lit la file locale en continu (courte fréquence,
 * pas d'abonnement pub/sub côté service) : c'est la même donnée que celle
 * qui déciderait, avec un vrai backend, si un envoi reste en attente.
 */
export function useSyncQueue(): EvenementFile[] {
  const [file, setFile] = useState<EvenementFile[]>(() => getFileAttente());

  useEffect(() => {
    const interval = setInterval(() => {
      setFile(getFileAttente());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return file;
}
