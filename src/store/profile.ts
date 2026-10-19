import { useSyncExternalStore } from "react";

// Tiny in-memory profile so Profile and Edit Profile stay in sync while there's no
// backend. No Provider needed: read it with useProfile(). Resets on app restart.
// TODO: load and save the profile through the API.

export type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string | null;
};

let state: ProfileState = {
  firstName: "Ari",
  lastName: "Explorer",
  email: "ari@example.com",
  phone: "",
  photo: null,
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

export function updateProfile(changes: Partial<ProfileState>) {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
}

export function useProfile() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}