import { create } from "zustand";
const MAX_MESSAGES = 25;

export const useMessageStore = create((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message];
      if (newMessages.length > MAX_MESSAGES) {
        newMessages.shift();
      }
      return { messages: newMessages };
    }),
  clearMessages: () => set({ messages: [] }),
}));
