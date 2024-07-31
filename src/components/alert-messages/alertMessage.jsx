import { useMessageStore } from "../../lib/stores/useMessageStore";

export const alertMessage = (message) => {
  const addMessage = useMessageStore.getState().addMessage;
  addMessage(message);
};
