import React, { useState } from "react";

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
  const [displayAlert, setDisplayAlert] = useState(
    display === "true" || display === true ? true : false
  );
  const onCheck = (e) => {
    setDisplayAlert(e.target.checked);
  };

  if (typeof document !== "undefined") {
    const alertElement = window.document.querySelector(`#${messageId}`);
    // make a scroll down on this div
    if (alertElement) {
      setTimeout(() => {
        alertElement.scrollTop = alertElement.scrollHeight;
      }, 100);
    }
  }
  if (trace) console.log("render [ShowDivAlertMessages], display:", display);

  return (
    <div
      style={style}
      className={clsx("flex w-80 flex-col items-center gap-2", className, {
        "opacity-20": !displayAlert,
        "opacity-100": displayAlert,
      })}
    >
      <div className="z-40 w-full rounded-md border shadow-lg">
        <div className="flex flex-row justify-between rounded-lg bg-secondary">
          <div className="w-1/5 items-center p-2 text-xl hover:cursor-move">
            <MdCopyAll />
          </div>
          <div className="w-3/5 p-2">
            <label className="m-0">
              Display Alert: &nbsp;
              <input
                type="checkbox"
                defaultChecked="true"
                onChange={(e) => onCheck(e)}
              />
            </label>
          </div>
        </div>
        {!displayAlert ? (
          <div></div>
        ) : (
          <div
            {...props}
            className="border-grey-100 max-h-48 w-80 rounded border bg-paper p-2"
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
        {messages.length > 0 && displayAlert && (
          <div className="flex justify-center bg-gray-200 p-3">
            <Button className="bg-secondary" onClick={() => clearMessages()}>
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
