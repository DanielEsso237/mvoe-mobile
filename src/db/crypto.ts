import * as Crypto from "expo-crypto";

/**
 * Hachage simple (SHA-256, sans sel) : suffisant pour une base locale de
 * démonstration hors-ligne, qui ne quitte jamais l'appareil telle quelle.
 * Ce n'est pas le mécanisme qu'on utiliserait pour une vraie base serveur.
 */
export async function hashText(value: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    value,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

export async function verifyHash(value: string, hash: string): Promise<boolean> {
  const computed = await hashText(value);
  return computed === hash;
}

export function nouvelIdentifiant(prefixe: string): string {
  return `${prefixe}-${Crypto.randomUUID()}`;
}
