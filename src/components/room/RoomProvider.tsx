import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

import { Rectangle } from "@/lib/canvas/types";

interface ScaleContextProps {
  scale: number;
  setScale: (scale: number) => void;
  getScale: () => number;
  selectedRect: Rectangle | null;
  setSelectedRect: (rect: Rectangle | null) => void;
  getSelectedRect: () => Rectangle | null;
}

const RoomContext = createContext<ScaleContextProps | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setStateScale] = useState<number>(1);

  const scaleRef = useRef<number>(1);
  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    setStateScale(newScale);
  }, []);

  const getScale = useCallback(() => {
    return scaleRef.current;
  }, []);

  const [selectedRect, setStateSelectedRect] = useState<Rectangle | null>(null);
  const selectedRectRef = useRef<Rectangle | null>(null);
  const setSelectedRect = useCallback((rect: Rectangle | null) => {
    if (rect) {
      // Vérifier si bottom et right sont définis, sinon les calculer
      if (rect.bottom === undefined || rect.right === undefined) {
        const calculatedRect = { ...rect };

        if (
          calculatedRect.bottom === undefined &&
          calculatedRect.top !== undefined &&
          calculatedRect.height !== undefined
        ) {
          calculatedRect.bottom = calculatedRect.top + calculatedRect.height;
        }

        if (
          calculatedRect.right === undefined &&
          calculatedRect.left !== undefined &&
          calculatedRect.width !== undefined
        ) {
          calculatedRect.right = calculatedRect.left + calculatedRect.width;
        }

        rect = calculatedRect;
      }
    }

    selectedRectRef.current = rect;
    setStateSelectedRect(rect);
  }, []);
  const getSelectedRect = useCallback(() => {
    return selectedRectRef.current;
  }, []);

  return (
    <RoomContext.Provider
      value={{
        scale: scale,
        setScale,
        getScale,
        selectedRect,
        setSelectedRect,
        getSelectedRect,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useScale = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useScale must be used within a RoomProvider");
  }
  return context;
};
