import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Button } from "../components/atom/Button";
import { withMousePosition } from "./withMousePosition";
import { MdCopyAll } from "react-icons/md";
import clsx from "clsx";

const MessageContext = createContext({
  alertMessage: () => {},
  useMessageListener: () => {},
});
const MAX_MESSAGES = 10;
const EVENT_NAME = "addMessage";

const addEventMessage = (message) => {
  const event = new CustomEvent(EVENT_NAME, { detail: { message } });
  document.dispatchEvent(event);
};

const useMessageListener = () => {
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    const handleAddMessage = (event) => {
      setNewMessage(event.detail.message);
    };

    document.addEventListener(EVENT_NAME, handleAddMessage);

    return () => {
      document.removeEventListener(EVENT_NAME, handleAddMessage);
    };
  }, []);
  // console.log("useMessgeListener, message:", newMessage);
  return newMessage;
};

export const MessageProvider = ({ children }) => {
  const alertMessage = (message) => {
    addEventMessage(message);
  };

  const values = {
    alertMessage,
    useMessageListener,
  };

  return (
    <MessageContext.Provider value={values}>{children}</MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

/**
 * ShowDivAlertMessages component to display messages in a div
 * @param {object} props
 * @param {string} props.style  - style of the div
 * @param {string} props.className - class of the div
 * @param {boolean} props.display - display messages in the div or not
 * @param {array} props.messages - array of messages to display
 * @param {function} props.clearMessages - function to clear messages
 */
const ShowDivAlertMessages = ({
  style,
  className,
  display,
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
  if (props?.trace)
    console.log("render [ShowDivAlertMessages], display:", display);

  return (
    <div
      style={style}
      className={clsx("flex w-80 flex-col items-center gap-2", className, {
        "opacity-20": !displayAlert,
        "opacity-100": displayAlert,
      })}
    >
      <div className="w-full rounded-md border shadow-lg">
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

/**
 * ShowAlertMessages component to display messages
 * @param {object} props
 * @param {boolean} props.display - display messages or not
 */
export const ShowAlertMessages = ({ display = true, ...props }) => {
  const [messages, setMessages] = useState([]);
  const { useMessageListener } = useMessage();
  const newMessage = useMessageListener();

  const addMessage = (message) => {
    setMessages((curr) => {
      if (curr.length > MAX_MESSAGES) {
        curr.shift();
      }
      return [...curr, message];
    });
  };

  useEffect(() => {
    if (!newMessage) return;

    // console.log("alertMessage recue:", newMessage);
    addMessage(newMessage);
  }, [newMessage]);

  return useMemo(() => {
    return (
      <ShowDivAlertMessages
        display={display}
        messages={messages}
        clearMessages={() => setMessages([])}
        {...props}
      />
    );
  }, [messages, display]);
};

export const ShowAlertMessagesWP = withMousePosition(ShowAlertMessages);
