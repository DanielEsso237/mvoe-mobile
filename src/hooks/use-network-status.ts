import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/**
 * L'état "en ligne / hors-ligne" du kit facilitateur : neutre tant que la
 * première mesure n'est pas arrivée, pour ne jamais annoncer "hors-ligne" à
 * tort pendant le chargement.
 */
export function useNetworkStatus(): boolean | null {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? null);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
