import { create } from "zustand";

const DEFAULT_MAX_LEN = 25;

export const useHistoryStore = create((set) => ({
  history: [],
  lastUndo: Date.now(),

  addHistoryItem: (item) =>
    set((state) => {
      const newHistory = [...state.history, item];
      if (newHistory.length > (state.maxLen || DEFAULT_MAX_LEN)) {
        newHistory.shift(); // Removes the first item if the max length is exceeded
      }
      return { history: newHistory };
    }),

  undoHistory: () =>
    set((state) => {
      if (state.history.length === 0) return state; // Return current state if history is empty

      const now = Date.now();
      if (now - state.lastUndo < 300) return state; // Debouncing undo

      const newHistory = state.history.slice(0, -1);
      return { history: newHistory, lastUndo: now };
    }),

  eraseHistory: () => set({ history: [] }),

  getCurrentHistory: () => {
    const state = useHistoryStore.getState();
    const last = state.history.length - 1;
    return last >= 0 ? state.history[last] : null;
  },

  getHistoryLength: () => {
    const state = useHistoryStore.getState();
    return state.history.length;
  },

  setMaxLen: (maxLen) => set({ maxLen }),
}));

export default useHistoryStore;
