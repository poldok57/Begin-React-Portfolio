"use client";
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
}: UseEventListenerProps) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    if (!element) {
      return;
    }

    const onEvent = (e: Event) => {
      handlerRef.current(e);
    };

    element.addEventListener(type, onEvent);

    return () => {
      element.removeEventListener(type, onEvent);
    };
  }, [isEnabled, type, element]);
};
