import { create } from "zustand";
import { Coordinate } from "@/lib/canvas/types";

interface HistoryEntry {
  id: string;
  timestamp: number;
  tables: {
    id: string;
    previousPosition: Coordinate;
    previousRotation?: number;
  }[];
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "timestamp">) => void;
  getLastEntry: () => HistoryEntry | null;
  removeLastEntry: () => void;
  canUndo: () => boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],

  addEntry: (entry) => {
    // Ne pas ajouter d'entrée si l'ID est identique à la dernière entrée
    const lastEntry = get().getLastEntry();
    if (lastEntry && lastEntry.id === entry.id) {
      return;
    }

    set((state) => ({
      entries: [...state.entries, { ...entry, timestamp: Date.now() }],
    }));
  },

  getLastEntry: () => {
    const { entries } = get();
    return entries.length > 0 ? entries[entries.length - 1] : null;
  },

  removeLastEntry: () => {
    set((state) => ({
      entries: state.entries.slice(0, -1),
    }));
  },

  canUndo: () => {
    return get().entries.length > 0;
  },
}));
