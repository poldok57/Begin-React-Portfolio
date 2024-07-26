"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { WindowType } from "./types";

interface WindowState {
  maximize: string;
  windows: WindowType[];
  addWindow: (window: WindowType) => void;
  getWindow: (id: string) => WindowType | undefined;
  existsWindow: (id: string) => boolean;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  upsertWindow: (window: WindowType) => void;
  removeWindow: (id: string) => void;
  setMaximize: (id: string) => void;
}

const zustandWindowStore = create<WindowState>((set, get) => ({
  windows: [],
  maximize: "",
  addWindow: (window: WindowType) =>
    set((state) => ({ windows: [...state.windows, window] })),
  getWindow: (id: string) => get().windows.find((w) => w.id === id),
  existsWindow: (id: string) => get().windows.some((w) => w.id === id),
  updateWindow: (id: string, updates: Partial<Window>) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),
  upsertWindow: (window: WindowType) =>
    set((state) => {
      const index = state.windows.findIndex((w) => w.id === window.id);
      if (index !== -1) {
        // La fenêtre existe, on la met à jour
        const updatedWindows = [...state.windows];
        updatedWindows[index] = { ...updatedWindows[index], ...window };
        return { windows: updatedWindows };
      } else {
        // La fenêtre n'existe pas, on l'ajoute
        return { windows: [...state.windows, window] };
      }
    }),
  removeWindow: (id: string) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),
  setMaximize: (id: string) => set({ maximize: id }), // Nouvelle fonction
}));

/**
 * Custom hook to access the timers store
 * @returns timers store
 */
export const useWindowStore = () => {
  return zustandWindowStore(
    useShallow((state: WindowState) => ({
      windows: state.windows,
      maximize: state.maximize,
    }))
  );
};
/**
 * Custom hook to access the timers store actions
 * @returns timers store actions
 */
export const useWindowActions = () => {
  return zustandWindowStore((state) => ({
    addWindow: state.addWindow,
    getWindow: state.getWindow,
    existsWindow: state.existsWindow,
    updateWindow: state.updateWindow,
    upsertWindow: state.upsertWindow,
    removeWindow: state.removeWindow,
    setMaximize: state.setMaximize,
  }));
};
