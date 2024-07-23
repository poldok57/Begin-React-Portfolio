import { useEffect, useRef } from "react";

interface UseEventListenerProps {
  handler: (e: Event) => void;
  isEnabled?: boolean;
  type: string;
  element?: HTMLElement | Window;
}

export const useEventListener = ({
  handler,
  isEnabled = true,
  type,
  element = window,
}: UseEventListenerProps): void => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isEnabled || !element) {
      return;
    }

    // The actual event listener logic should go here
    // For example:
    const eventListener = (event: Event) => handlerRef.current(event);
    element.addEventListener(type, eventListener);

    // Cleanup function
    return () => {
      element.removeEventListener(type, eventListener);
    };
  }, [type, element, isEnabled]);
};
