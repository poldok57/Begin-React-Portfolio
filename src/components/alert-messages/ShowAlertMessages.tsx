"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useMessageStore } from "@/lib/stores/useMessageStore";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { useComponentSize } from "@/components/windows/WithResizing";

import { Button } from "@/components/atom/Button";
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
  messages: string[];
  clearMessages: () => void;
}

const DEFAULT_MAX_HEIGHT = 220;

export const ShowDivAlertMessages: React.FC<ShowDivAlertMessagesProps> = ({
  style,
  className,
  display,
  messages,
  clearMessages,
  ...props
}) => {
  const messageId = "alert-messages";
  const ref = useRef<HTMLDivElement>(null);
  const [displayAlert, setDisplayAlert] = useState(display);
  const [maxHeight, setMaxHeight] = useState(DEFAULT_MAX_HEIGHT);
  const onCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayAlert(e.target.checked);
  };
  const { componentSize, setMinimumSize } = useComponentSize();

  setMinimumSize({ width: 290, height: DEFAULT_MAX_HEIGHT + 60 });

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

  useEffect(() => {
    // console.log("height", componentSize.height);
    setMaxHeight(Math.max(DEFAULT_MAX_HEIGHT, componentSize.height - 60));
  }, [componentSize]);

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(
        "flex flex-col gap-2 items-center w-full min-w-72",
        className,
        {
          "opacity-20": !displayAlert,
          "opacity-100": displayAlert,
        }
      )}
    >
      <div className="z-40 w-full h-full rounded-md border shadow-lg min-h-fit">
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
            className="p-2 w-full h-full max-h-56 rounded border min-h-16 border-grey-100 bg-paper"
            id={messageId}
            style={{
              overflowY: "scroll",
              maxHeight: `${maxHeight}px`,
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
 */
interface ShowAlertMessagesProps {
  display?: boolean;
}

export const ShowAlertMessages: React.FC<ShowAlertMessagesProps> = ({
  display = true,
  ...props
}) => {
  const { messages, clearMessages } = useMessageStore((state) => ({
    messages: state.messages,
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

export const ShowAlertMessagesWP = withMousePosition(ShowAlertMessages);
