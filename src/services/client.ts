/**
 * Il n'y a pas de vrai backend pour l'instant : chaque service simule un
 * appel réseau (léger délai + copie profonde des données mockées) pour que
 * les écrans se comportent déjà comme s'ils consommaient une API, et que le
 * remplacement par de vraies requêtes plus tard ne change aucune UI.
 */
export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(value)), ms);
  });
}

function clone<T>(value: T): T {
  return typeof value === "object" && value !== null
    ? JSON.parse(JSON.stringify(value))
    : value;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}
