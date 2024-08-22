import { useMessageStore } from "../../lib/stores/useMessageStore";

export const alertMessage = (message: string) => {
  const addMessage = useMessageStore.getState().addMessage;
  addMessage(message);
};
