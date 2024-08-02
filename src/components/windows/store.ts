"use client";
import { useState, useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { WindowType } from "./types";
import { TITLE_HEIGHT } from "./window-size";

export const generateRandomKey = () => Math.random().toString(36).slice(2, 9);
interface WindowState {
  maximizeId: string;
  windows: WindowType[];
  addWindow: (window: WindowType) => void;
  getWindow: (id: string) => WindowType | undefined;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  upsertWindow: (window: WindowType) => void;
  removeWindow: (id: string) => void;
  setMaximize: (id: string) => void;
}

const zustandWindowStore = create<WindowState>((set, get) => ({
  windows: [],
  maximizeId: "",
  addWindow: (window: WindowType) =>
    set((state) => ({ windows: [...state.windows, window] })),
  getWindow: (id: string) => get().windows.find((w) => w.id === id),
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
  setMaximize: (id: string) => set({ maximizeId: id }), // Nouvelle fonction
}));

/**
 * Custom hook to access the store
 * @returns  store
 */
// export const useWindowStore = () => {
//   return zustandWindowStore(
//     useShallow((state: WindowState) => ({
//       windows: state.windows,
//       maximizeId: state.maximizeId,
//     }))
//   );
// };
export const useWindowStore = <T>(selector?: (state: WindowState) => T): T => {
  return zustandWindowStore(
    useShallow((state) => (selector ? selector(state) : (state as T)))
  );
};

/**
 * Fonction personnalisée pour obtenir l'ID de la fenêtre maximisée
 * @returns l'ID de la fenêtre maximisée
 */
export const useMaximizedWindowId = (): string => {
  return zustandWindowStore(useShallow((state) => state.maximizeId));
};

/**
 * Custom hook to access the timers store actions
 * @returns timers store actions
 */
export const useWindowActions = () => {
  return zustandWindowStore((state) => ({
    addWindow: state.addWindow,
    getWindow: state.getWindow,
    updateWindow: state.updateWindow,
    upsertWindow: state.upsertWindow,
    removeWindow: state.removeWindow,
    setMaximize: state.setMaximize,
  }));
};

/**
 * Hook personnalisé pour gérer la barre des tâches contenant les fenêtres minimisées
 */
export const useTaskbar = (withMinimizedWindows: boolean = false) => {
  const { windows } = zustandWindowStore((state) => ({
    windows: state.windows,
  }));
  const [taskbarItems, setTaskbarItems] = useState<WindowType[]>([]);

  useEffect(() => {
    const minimizedWindows = windows.filter((w) => w.isMinimized);
    setTaskbarItems(minimizedWindows);

    if (!withMinimizedWindows) {
      return;
    }

    const distributeWindows = () => {
      const screenWidth = window.innerWidth;
      const minWidth = 120;
      const maxWidth = screenWidth / 5;
      const availableWidth = screenWidth - 2; // 2px pour les marges
      const itemCount = minimizedWindows.length;
      const itemWidth = Math.max(
        minWidth,
        Math.min(maxWidth, availableWidth / itemCount)
      );

      minimizedWindows.forEach((window, index) => {
        if (window.htmlDiv) {
          window.htmlDiv.style.width = `${itemWidth}px`;
          window.htmlDiv.style.height = `${TITLE_HEIGHT}px`;
          window.htmlDiv.style.left = `${index * itemWidth + 1}px`;
          window.htmlDiv.style.top = "auto"; // `${window.innerHeight - TITLE_HEIGHT}px`;
          window.htmlDiv.style.bottom = `-${TITLE_HEIGHT + 5}px`;
          window.htmlDiv.style.position = "fixed";
          window.htmlDiv.style.overflow = "hidden";
          window.htmlDiv.style.opacity = "0";
          console.log(
            `${window.title} - ${index}  left: ${window.htmlDiv.style.left}`
          );
        }
      });
    };

    distributeWindows();
    window.addEventListener("resize", distributeWindows);

    return () => {
      window.removeEventListener("resize", distributeWindows);
    };
  }, [windows]);

  return { taskbarItems };
};
