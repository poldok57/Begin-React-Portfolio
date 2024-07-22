import React, { useContext, createContext, useRef } from "react";

const DrawContext = createContext(null);

const DEFAULT_MAX_LEN = 10;

export const HistoryProvider = ({
  maxLen = 0,
  children,
}: {
  maxLen?: number;
  children: React.ReactNode;
}) => {
  const historyRef = useRef([]);

  const maxHistoryLen: number = maxLen || DEFAULT_MAX_LEN;

  const lastUndo = useRef(0);
  const undoHistory = () => {
    const history = historyRef.current;
    if (history.length === 0) return;

    // debounce undo
    if (Date.now() - lastUndo.current < 300) {
      return;
    }
    lastUndo.current = Date.now();

    history.pop();

    // console.log("undoHistory", history.length);
  };

  const addHistoryItem = (item) => {
    if (historyRef.current === null) {
      historyRef.current = [];
    }
    historyRef.current.push(item);
    if (historyRef.current.length > maxHistoryLen) {
      historyRef.current.shift();
    }
  };
  const eraseHistory = () => {
    historyRef.current = [];
  };
  const getCurrentHistory = () => {
    // return last item in the history
    const last = historyRef.current.length - 1;
    if (last < 0) return null;
    return historyRef.current[last];
  };
  const getHistoryLength = () => {
    return historyRef.current.length;
  };
  const values = {
    undoHistory,
    addHistoryItem,
    getCurrentHistory,
    getHistoryLength,
    eraseHistory,
  };

  return <DrawContext.Provider value={values}>{children}</DrawContext.Provider>;
};

export const useHistory = () => {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useHistory must be used within a historyProvider");
  }
  return context;
};
