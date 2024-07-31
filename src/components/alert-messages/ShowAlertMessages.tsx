"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useMessageStore } from "../../lib/stores/useMessageStore";

import { Button } from "../atom/Button";
import { MdCopyAll } from "react-icons/md";
import clsx from "clsx";

/**
 * ShowDivAlertMessages component to display messages in a div
 * @param {object} props
 * @param {string} props.style  - style of the div
 * @param {string} props.className - class of the div
 * @param {boolean} props.display - display messages in the div or not
 * @param {array} props.messages - array of messages to display
 * @param {function} props.clearMessages - function to clear messages
 */
interface ShowDivAlertMessagesProps {
  style?: React.CSSProperties;
  className?: string;
  display: boolean;
  trace?: boolean;
  messages: string[];
  clearMessages: () => void;
}

export const ShowDivAlertMessages: React.FC<ShowDivAlertMessagesProps> = ({
  style,
  className,
  display,
  trace,
  messages,
  clearMessages,
  ...props
}) => {
  const messageId = "alert-messages";
  const [displayAlert, setDisplayAlert] = useState(display);
  const onCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayAlert(e.target.checked);
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const alertElement = document.querySelector(`#${messageId}`);
    // make a scroll down on this div
    let timerId: number | NodeJS.Timeout = 0;
    if (alertElement) {
      timerId = setTimeout(() => {
        alertElement.scrollTop = alertElement.scrollHeight;
      }, 100);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [messages]);

  if (trace) console.log("render [ShowDivAlertMessages], display:", display);

  return (
    <div
      style={style}
      className={clsx("flex flex-col gap-2 items-center w-80", className, {
        "opacity-20": !displayAlert,
        "opacity-100": displayAlert,
      })}
    >
      <div className="z-40 w-full rounded-md border shadow-lg">
        <div className="flex flex-row justify-between rounded-lg bg-secondary">
          <div className="items-center p-1 w-1/5 text-xl hover:cursor-move">
            <MdCopyAll size={10} />
          </div>
          <div className="w-full text-xs text-center group-hover:hidden">
            Alert messages
          </div>
        </div>
        {displayAlert && (
          <div
            {...props}
            className="p-2 w-80 max-h-48 rounded border border-grey-100 bg-paper"
            id={messageId}
            style={{
              overflowY: "scroll",
            }}
          >
            <ul style={{ listStyleType: "none" }}>
              {messages.map((message: string, idx: number) => (
                <li key={idx}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        {messages.length > 0 && (
          <div className="flex flex-row justify-between items-center p-1 bg-gray-200">
            <div className="w-3/4">
              <label className="flex flex-row p-1 w-full cursor-pointer text-primary">
                Display Alert: &nbsp;
                <input
                  type="checkbox"
                  defaultChecked={true}
                  onChange={(e) => onCheck(e)}
                />
              </label>
            </div>
            {displayAlert && (
              <Button
                className="bg-secondary btn-sm"
                onClick={() => clearMessages()}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
