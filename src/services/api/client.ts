/**
 * Adresse de l'API Laravel de référence (voir ../mvoe/routes/api.php).
 * Portée par `EXPO_PUBLIC_API_BASE_URL` (fichier .env) : Metro l'inline
 * directement dans le bundle au build, ce qui est fiable sur toutes les
 * plateformes — `Constants.expoConfig.extra` ne se charge pas de façon
 * fiable côté web en développement. Si le serveur n'est pas joignable,
 * chaque appel échoue par erreur réseau, ce qui est le comportement normal
 * d'une appli hors-ligne d'abord : l'écriture reste dans la file locale
 * (`src/db/repositories/syncQueue.ts`) jusqu'à ce qu'un serveur réponde.
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiNetworkError extends Error {
  constructor(message = "Le serveur est injoignable.") {
    super(message);
    this.name = "ApiNetworkError";
  }
}

export class ApiResponseError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
  }
}

export interface ApiRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Un seul point d'entrée réseau pour toute l'appli. N'importe quel échec
 * (hors-ligne, timeout, 4xx/5xx) remonte comme une exception : à
 * l'appelant — presque toujours le moteur de synchronisation — de décider
 * de laisser l'écriture en file plutôt que de la perdre.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 8000
  );

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new ApiResponseError(response.status, text || response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    throw new ApiNetworkError(
      error instanceof Error ? error.message : "Erreur réseau."
    );
  } finally {
    clearTimeout(timeout);
  }
}
