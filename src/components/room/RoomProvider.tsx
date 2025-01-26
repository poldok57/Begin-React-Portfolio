import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

import { Rectangle } from "@/lib/canvas/types";
import { Mode } from "@/components/room/types";

interface RoomContextProps {
  ctxTemporary: CanvasRenderingContext2D | null;
  setCtxTemporary: (ctx: CanvasRenderingContext2D | null) => void;
  scale: number;
  setScale: (scale: number) => void;
  getScale: () => number;
  rotation: number;
  setRotation: (rotation: number) => void;
  getRotation: () => number;
  getElementRect: (id: string) => Rectangle | null;
  selectedRect: Rectangle | null;
  setSelectedRect: (rect: Rectangle | null) => void;
  getSelectedRect: (scaleSize?: boolean) => Rectangle | null;
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  getMode: () => Mode | null;
  selectedTableIds: string[];
  addSelectedTableId: (id: string) => void;
  removeSelectedTableId: (id: string) => void;
  clearSelectedTableIds: () => void;
  needRefresh: () => void;
  storeName: string | null;
  setStoreName: (storeName: string | null) => void;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ctxTemporary, setCtxTemporary] =
    useState<CanvasRenderingContext2D | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [toRefresh, setToRefresh] = useState<number>(0);
  const [scale, setStateScale] = useState<number>(1);
  const scaleRef = useRef<number>(1);
  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    setStateScale(newScale);
  }, []);

  const needRefresh = useCallback(() => {
    setToRefresh(toRefresh + 1);
  }, []);

  const getScale = useCallback(() => {
    return scaleRef.current;
  }, []);

  const [rotation, setStateRotation] = useState<number>(0);
  const rotationRef = useRef<number>(0);

  const setRotation = useCallback((newRotation: number) => {
    rotationRef.current = newRotation;
    setStateRotation(newRotation);
  }, []);

  const getRotation = () => {
    return rotationRef.current;
  };

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
  const getSelectedRect = useCallback((scaleSize: boolean = false) => {
    const rect = selectedRectRef.current;
    const scale = getScale();
    if (rect) {
      if (scale === 1 || scaleSize) {
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

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  const addSelectedTableId = useCallback((id: string) => {
    setSelectedTableIds((prevIds) => Array.from(new Set([...prevIds, id])));
  }, []);

  const removeSelectedTableId = useCallback((id: string) => {
    setSelectedTableIds((prevIds) =>
      prevIds.filter((tableId) => tableId !== id)
    );
  }, []);

  const clearSelectedTableIds = useCallback(() => {
    setSelectedTableIds([]);
  }, []);

  const [mode, setStateMode] = useState<Mode | null>(null);
  const modeRef = useRef<Mode | null>(null);

  const setMode = useCallback((newMode: Mode) => {
    modeRef.current = newMode;
    setStateMode(newMode);
  }, []);

  const getMode = useCallback(() => {
    return modeRef.current;
  }, []);

  return (
    <RoomContext.Provider
      value={{
        ctxTemporary,
        setCtxTemporary,
        scale: scale,
        setScale,
        getScale,
        getElementRect,
        selectedRect,
        setSelectedRect,
        getSelectedRect,
        rotation,
        setRotation,
        getRotation,
        mode,
        setMode,
        getMode,
        selectedTableIds,
        addSelectedTableId,
        removeSelectedTableId,
        clearSelectedTableIds,
        needRefresh,
        storeName,
        setStoreName,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
};
