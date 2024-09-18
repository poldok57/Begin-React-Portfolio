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
  getElementRect: (id: string) => Rectangle | null;
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

  const getElementRect = useCallback((id: string) => {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (!rect) {
      return null;
    }
    return {
      left: rect.left / scaleRef.current,
      top: rect.top / scaleRef.current,
      width: rect.width / scaleRef.current,
      height: rect.height / scaleRef.current,
    };
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
    const rect = selectedRectRef.current;
    const scale = getScale();
    if (rect) {
      if (scale === 1) {
        return rect;
      }
      return {
        left: Math.round(rect.left / scale),
        top: Math.round(rect.top / scale),
        width: Math.round(rect.width / scale),
        height: Math.round(rect.height / scale),
        right: Math.round((rect.right ?? rect.left + rect.width) / scale),
        bottom: Math.round((rect.bottom ?? rect.top + rect.height) / scale),
      };
    }
    return null;
  }, []);

  return (
    <RoomContext.Provider
      value={{
        scale: scale,
        setScale,
        getScale,
        getElementRect,
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
