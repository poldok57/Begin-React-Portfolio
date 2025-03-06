import { create } from "zustand";
import { Rectangle } from "@/lib/canvas/types";
import { Mode } from "@/components/room/types";

const DESIGN_STORE_NAME = "room-design-storage";
const TABLES_STORE_NAME = "room-tables-storage";

const traceClear = false;

interface RoomState {
  // Canvas context
  ctxTemporary: CanvasRenderingContext2D | null;
  setCtxTemporary: (ctx: CanvasRenderingContext2D | null) => void;
  getCtxTemporary: () => CanvasRenderingContext2D | null;
  clearTemporaryCanvas: (reason?: string) => void;

  // Scale and rotation
  scale: number;
  setScale: (scale: number) => void;
  getScale: () => number;
  rotation: number;
  setRotation: (rotation: number) => void;
  getRotation: () => number;

  // Element rectangles
  getElementRect: (id: string) => Rectangle | null;

  // pre selection
  preSelection: Rectangle | null;
  setPreSelection: (rect: Rectangle | null) => void;
  getPreSelection: () => Rectangle | null;

  // Selected rectangle
  selectedRect: Rectangle | null;
  setSelectedRect: (rect: Rectangle | null) => void;
  getSelectedRect: (scaleSize?: boolean) => Rectangle | null;

  // Mode
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  getMode: () => Mode | null;

  // Selected tables
  selectedTableIds: string[];
  addSelectedTableId: (id: string) => void;
  removeSelectedTableId: (id: string) => void;
  clearSelectedTableIds: () => void;

  // Refresh trigger
  refreshCounter: number;
  needRefresh: () => void;

  // Store names
  designStoreName: string;
  tablesStoreName: string;
  setStoreName: (storeName?: string | null) => void;

  // Layout
  maxRowsPerColumn: number;
  setMaxRowsPerColumn: (maxRowsPerColumn: number) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  // Canvas context
  ctxTemporary: null,
  setCtxTemporary: (ctx) => set({ ctxTemporary: ctx }),
  getCtxTemporary: () => get().ctxTemporary,
  clearTemporaryCanvas: (reason) => {
    const ctx = get().ctxTemporary;
    if (ctx && ctx.canvas) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    if (traceClear) {
      console.log("clear temporary canvas: ", reason ?? "unknown");
    }
  },

  // Scale and rotation
  scale: 1,
  setScale: (scale) => set({ scale }),
  getScale: () => get().scale,
  rotation: 0,
  setRotation: (rotation) => set({ rotation }),
  getRotation: () => get().rotation,

  // Element rectangles
  getElementRect: (id) => {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (!rect) {
      return null;
    }
    const scale = get().scale;
    return {
      left: rect.left / scale,
      top: rect.top / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  },

  // pre selection
  preSelection: null,
  setPreSelection: (rect) => set({ preSelection: rect }),
  getPreSelection: () => get().preSelection,

  // Selected rectangle
  selectedRect: null,
  setSelectedRect: (rect) => set({ selectedRect: rect }),
  getSelectedRect: (scaleSize = false) => {
    const rect = get().selectedRect;
    if (!rect || scaleSize) return rect;

    const scale = get().scale;
    return {
      left: Math.round(rect.left / scale),
      top: Math.round(rect.top / scale),
      width: Math.round(rect.width / scale),
      height: Math.round(rect.height / scale),
      right: Math.round((rect.right ?? rect.left + rect.width) / scale),
      bottom: Math.round((rect.bottom ?? rect.top + rect.height) / scale),
    };
  },

  // Mode
  mode: null,
  setMode: (mode) => set({ mode }),
  getMode: () => get().mode,

  // Selected tables
  selectedTableIds: [],
  addSelectedTableId: (id) =>
    set((state) => ({
      selectedTableIds: state.selectedTableIds.includes(id)
        ? state.selectedTableIds
        : [...state.selectedTableIds, id],
    })),
  removeSelectedTableId: (id) =>
    set((state) => ({
      selectedTableIds: state.selectedTableIds.filter(
        (tableId) => tableId !== id
      ),
    })),
  clearSelectedTableIds: () => set({ selectedTableIds: [] }),

  // Refresh trigger
  refreshCounter: 0,
  needRefresh: () =>
    set((state) => ({ refreshCounter: state.refreshCounter + 1 })),

  // Store names
  designStoreName: DESIGN_STORE_NAME,
  tablesStoreName: TABLES_STORE_NAME,
  setStoreName: (storeName) => {
    const baseName = storeName || "";
    const designStoreName = baseName
      ? `room-${baseName}-design`
      : DESIGN_STORE_NAME;
    const tablesStoreName = baseName
      ? `room-${baseName}-tables`
      : TABLES_STORE_NAME;

    set({ designStoreName, tablesStoreName });

    // return { designStoreName, tablesStoreName };
  },

  // Layout
  maxRowsPerColumn: 10,
  setMaxRowsPerColumn: (maxRowsPerColumn) => set({ maxRowsPerColumn }),
}));
