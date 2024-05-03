import { useMessageStore } from "../lib/messages/useMessageStore";

export const alertMessage = (message) => {
  const addMessage = useMessageStore.getState().addMessage;
  addMessage(message);
};
