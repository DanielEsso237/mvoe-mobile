import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getDb } from "@/db/client";
import {
  loginFacilitateur as loginFacilitateurService,
  loginParent as loginParentService,
  loginSuperviseur as loginSuperviseurService,
  logout as logoutService,
  LoginFacilitateurInput,
  LoginParentInput,
  LoginSuperviseurInput,
} from "@/services/session";
import { demarrerMoteurSynchronisation } from "@/services/sync/engine";
import type { FacilitateurSession, ParentSession, SuperviseurSession } from "@/types";

const STORAGE_KEYS = {
  facilitateur: "mvoe.session.facilitateur",
  parent: "mvoe.session.parent",
  superviseur: "mvoe.session.superviseur",
} as const;

interface AuthState {
  facilitateur: FacilitateurSession | null;
  parent: ParentSession | null;
  superviseur: SuperviseurSession | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  loginFacilitateur: (input: LoginFacilitateurInput) => Promise<FacilitateurSession>;
  loginParent: (input: LoginParentInput) => Promise<ParentSession>;
  loginSuperviseur: (input: LoginSuperviseurInput) => Promise<SuperviseurSession>;
  setParentSession: (session: ParentSession | null) => Promise<void>;
  logoutFacilitateur: () => Promise<void>;
  logoutParent: () => Promise<void>;
  logoutSuperviseur: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readStorage<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function writeStorage(key: string, value: unknown): Promise<void> {
  if (value === null || value === undefined) {
    await AsyncStorage.removeItem(key);
  } else {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    facilitateur: null,
    parent: null,
    superviseur: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      // La base locale (SQLite) tient lieu de backend hors-ligne : elle doit
      // être ouverte, migrée et amorcée avant toute tentative de connexion.
      await getDb();
      demarrerMoteurSynchronisation();

      const [facilitateur, parent, superviseur] = await Promise.all([
        readStorage<FacilitateurSession>(STORAGE_KEYS.facilitateur),
        readStorage<ParentSession>(STORAGE_KEYS.parent),
        readStorage<SuperviseurSession>(STORAGE_KEYS.superviseur),
      ]);
      setState({ facilitateur, parent, superviseur, isLoading: false });
    })();
  }, []);

  const loginFacilitateur = useCallback(
    async (input: LoginFacilitateurInput) => {
      const session = await loginFacilitateurService(input);
      await writeStorage(STORAGE_KEYS.facilitateur, session);
      setState((s) => ({ ...s, facilitateur: session }));
      return session;
    },
    []
  );

  const loginParent = useCallback(async (input: LoginParentInput) => {
    const session = await loginParentService(input);
    await writeStorage(STORAGE_KEYS.parent, session);
    setState((s) => ({ ...s, parent: session }));
    return session;
  }, []);

  const loginSuperviseur = useCallback(async (input: LoginSuperviseurInput) => {
    const session = await loginSuperviseurService(input);
    await writeStorage(STORAGE_KEYS.superviseur, session);
    setState((s) => ({ ...s, superviseur: session }));
    return session;
  }, []);

  // Utilisé pour l'accès anonyme au catalogue (sans code parent) : une
  // session "sans jeton" mais avec une langue choisie.
  const setParentSession = useCallback(async (session: ParentSession | null) => {
    await writeStorage(STORAGE_KEYS.parent, session);
    setState((s) => ({ ...s, parent: session }));
  }, []);

  const logoutFacilitateur = useCallback(async () => {
    await logoutService(state.facilitateur?.token);
    await writeStorage(STORAGE_KEYS.facilitateur, null);
    setState((s) => ({ ...s, facilitateur: null }));
  }, [state.facilitateur]);

  const logoutParent = useCallback(async () => {
    await logoutService(state.parent?.token);
    await writeStorage(STORAGE_KEYS.parent, null);
    setState((s) => ({ ...s, parent: null }));
  }, [state.parent]);

  const logoutSuperviseur = useCallback(async () => {
    await logoutService(state.superviseur?.token);
    await writeStorage(STORAGE_KEYS.superviseur, null);
    setState((s) => ({ ...s, superviseur: null }));
  }, [state.superviseur]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      loginFacilitateur,
      loginParent,
      loginSuperviseur,
      setParentSession,
      logoutFacilitateur,
      logoutParent,
      logoutSuperviseur,
    }),
    [
      state,
      loginFacilitateur,
      loginParent,
      loginSuperviseur,
      setParentSession,
      logoutFacilitateur,
      logoutParent,
      logoutSuperviseur,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return ctx;
}
