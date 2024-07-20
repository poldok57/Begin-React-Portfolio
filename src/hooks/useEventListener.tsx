"use client";
import { useEffect, useRef } from "react";

export const useEventListener = ({
  handler,
  isEnabled = true,
  type,
  element = window,
}) => {
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

    const onEvent = (e) => {
      handlerRef.current(e);
    };

    element.addEventListener(type, onEvent);

    return () => {
      element.removeEventListener(type, onEvent);
    };
  }, [isEnabled, type, element]);
};
