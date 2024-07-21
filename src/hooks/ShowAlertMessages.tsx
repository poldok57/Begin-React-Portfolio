import React, { useMemo } from "react";

import { useMessageStore } from "../lib/stores/useMessageStore";
import { ShowDivAlertMessages } from "./ShowDivAlertMessages";

/**
 * ShowAlertMessages component to display messages in a div
 * @param {object} props
 * @param {boolean} props.display - display messages in the div or not
 * @param {boolean} props.trace - trace the render
 */
interface ShowAlertMessagesProps {
  display?: boolean;
  trace?: boolean;
}

export const ShowAlertMessages: React.FC<ShowAlertMessagesProps> = ({
  display = true,
  trace = false,
  ...props
}) => {
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
        trace={trace}
        {...props}
      />
    );
  }, [messages, display]);
};
