import type { Unsubscribe } from "firebase/auth";

type AuthStateListener = (user: unknown) => void;

const listeners = new Set<AuthStateListener>();

export const auth = {
  onAuthStateChanged(callback: AuthStateListener): Unsubscribe {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },
};

export const triggerAuthStateChange = (user: unknown) => {
  for (const listener of listeners) {
    listener(user);
  }
};

export const firebaseApp = {} as Record<string, never>;
export const db = {} as Record<string, never>;
export const functions = {} as Record<string, never>;

