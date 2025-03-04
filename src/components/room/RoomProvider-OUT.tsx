import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

import { Rectangle } from "@/lib/canvas/types";
import { Mode } from "@/components/room/types";
// import { GROUND_ID } from "./RoomCreat";

const DESIGN_STORE_NAME = "room-design-storage";
const TABLES_STORE_NAME = "room-tables-storage";

interface RoomContextProps {
  getCtxTemporary: () => CanvasRenderingContext2D | null;
  setCtxTemporary: (ctx: CanvasRenderingContext2D | null) => void;
  clearTemporaryCanvas: (reason?: string) => void;
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
  designStoreName: string;
  tablesStoreName: string;
  setStoreName: (storeName?: string | null) => {
    designStoreName: string;
    tablesStoreName: string;
  };
  maxRowsPerColumn: number;
  setMaxRowsPerColumn: (maxRowsPerColumn: number) => void;
}

const traceClear = false;
const RoomContext = createContext<RoomContextProps | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ctxTemporaryRef = useRef<CanvasRenderingContext2D | null>(null);
  const [designStoreName, setDesignStoreName] =
    useState<string>(DESIGN_STORE_NAME);
  const [tablesStoreName, setTablesStoreName] =
    useState<string>(TABLES_STORE_NAME);
  const [, setToRefresh] = useState<number>(0);
  const [scale, setStateScale] = useState<number>(1);
  const scaleRef = useRef<number>(1);
  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    setStateScale(newScale);
  }, []);
  const [maxRowsPerColumn, setMaxRowsPerColumn] = useState<number>(20);

  const setCtxTemporary = useCallback(
    (newCtxTemporary: CanvasRenderingContext2D | null) => {
      ctxTemporaryRef.current = newCtxTemporary;
    },
    []
  );

  const needRefresh = useCallback(() => {
    setToRefresh((prev) => prev + 1);
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
      // Check if bottom and right are defined, otherwise calculate them
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

  const getCtxTemporary = useCallback(() => {
    return ctxTemporaryRef.current;
  }, []);

  const clearTemporaryCanvas = (reason?: string) => {
    const ctx = getCtxTemporary();
    if (!ctx) {
      // console.log("ctxTemporary is null");
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (traceClear) {
      console.log("clear temporary canvas: ", reason ?? "unknown");
    }
  };

  const setStoreName = useCallback((storeName?: string | null) => {
    const designStoreName =
      DESIGN_STORE_NAME + (storeName ? "_" + storeName : "");
    const tablesStoreName =
      TABLES_STORE_NAME + (storeName ? "_" + storeName : "");
    setDesignStoreName(designStoreName);
    setTablesStoreName(tablesStoreName);

    return { designStoreName, tablesStoreName };
  }, []);

  return (
    <RoomContext.Provider
      value={{
        getCtxTemporary,
        setCtxTemporary,
        clearTemporaryCanvas,
        scale: scale,
        setScale,
        getScale,
        getElementRect,
        // isInContainer,
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
        designStoreName,
        tablesStoreName,
        setStoreName,
        maxRowsPerColumn,
        setMaxRowsPerColumn,
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
