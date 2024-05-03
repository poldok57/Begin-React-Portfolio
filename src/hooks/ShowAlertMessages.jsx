import React, { useMemo } from "react";

import { useMessageStore } from "../lib/messages/useMessageStore";
import { ShowDivAlertMessages } from "./ShowDivAlertMessages";

export const ShowAlertMessages = ({ display = true, ...props }) => {
  const { messages, clearMessages } = useMessageStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    clearMessages: state.clearMessages,
  }));

  // useMemo hook to optimize the rendering
  return useMemo(() => {
    return (
      <ShowDivAlertMessages
        display={display}
        messages={messages}
        clearMessages={clearMessages}
        {...props}
      />
    );
  }, [messages, display]);
};
