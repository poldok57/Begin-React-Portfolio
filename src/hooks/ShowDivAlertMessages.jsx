import React, { useState, useEffect } from "react";

import { Button } from "../components/atom/Button";
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
export const ShowDivAlertMessages = ({
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
  const onCheck = (e) => {
    setDisplayAlert(e.target.checked);
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const alertElement = document.querySelector(`#${messageId}`);
    // make a scroll down on this div
    let timerId = 0;
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
      className={clsx("flex w-80 flex-col items-center gap-2", className, {
        "opacity-20": !displayAlert,
        "opacity-100": displayAlert,
      })}
    >
      <div className="z-40 w-full border rounded-md shadow-lg">
        <div className="flex flex-row justify-between rounded-lg bg-secondary">
          <div className="items-center w-1/5 p-1 text-xl hover:cursor-move">
            <MdCopyAll size={10} />
          </div>
          <div className="w-full text-xs text-center group-hover:hidden">
            Alert messages
          </div>
        </div>
        {displayAlert && (
          <div
            {...props}
            className="p-2 border rounded border-grey-100 max-h-48 w-80 bg-paper"
            id={messageId}
            style={{
              overflowY: "scroll",
            }}
          >
            <ul style={{ listStyleType: "none" }}>
              {messages.map((message, idx) => (
                <li key={idx}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        {messages.length > 0 && (
          <div className="flex flex-row items-center justify-between p-2 bg-gray-200">
            <div className="w-2/3 p-2">
              <label className="m-0">
                Display Alert: &nbsp;
                <input
                  type="checkbox"
                  defaultChecked={true}
                  onChange={(e) => onCheck(e)}
                />
              </label>
            </div>
            {displayAlert && (
              <Button className="bg-secondary" onClick={() => clearMessages()}>
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
