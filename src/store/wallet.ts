import { useSyncExternalStore } from "react";

// Tiny in-memory wallet so the UI can show earned points while there's no backend.
// No Provider needed: any screen can read it with useWallet().
// It resets when the app restarts.
// TODO: replace with the real balance/activity from the API.

export type Activity = {
  id: string;
  title: string;
  time: string;
  points: number;
  // "earned" = visited a landmark, "spent" = redeemed a reward.
  type: "earned" | "spent";
};

type WalletState = {
  balance: number;
  activities: Activity[];
};

// Starts empty: the balance only grows from visits the user actually validates.
let state: WalletState = {
  balance: 0,
  activities: [],
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

const formatNow = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const suffix = hours < 12 ? "AM" : "PM";
  return `Today, ${hours % 12 || 12}:${minutes} ${suffix}`;
};

// Call after a visit is validated.
export function earnPoints(title: string, points: number) {
  state = {
    balance: state.balance + points,
    activities: [
      { id: String(Date.now()), title, time: formatNow(), points, type: "earned" },
      ...state.activities,
    ],
  };
  listeners.forEach((listener) => listener());
}

// Call when the user redeems a reward. Returns false if they can't afford it.
export function spendPoints(title: string, points: number) {
  if (points > state.balance) return false;

  state = {
    balance: state.balance - points,
    activities: [
      { id: String(Date.now()), title, time: formatNow(), points, type: "spent" },
      ...state.activities,
    ],
  };
  listeners.forEach((listener) => listener());
  return true;
}

export function useWallet() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}