import { Mode } from "@/components/room/types";
import { Rectangle } from "@/lib/canvas/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandDesignStore } from "./design";
import { zustandTableStore } from "./tables";

const DESIGN_STORE_NAME = "room-design-storage";
const TABLES_STORE_NAME = "room-tables-storage";

const traceClear = false;

interface ScalesMap {
  [placeId: string]: number;
}

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
  scalesMap: ScalesMap;
  saveScaleForCurrentPlace: () => void;
  loadScaleForCurrentPlace: () => void;
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
  defaultMode: Mode;
  setDefaultMode: (mode: Mode) => void;
  getDefaultMode: () => Mode;

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
  getStoreName: (storeName?: string | null) => {
    designStoreName: string;
    tablesStoreName: string;
  };
  setStoreName: (storeName?: string | null) => void;
  resetRoom: (storeName?: string | null) => boolean;

  // Layout
  maxRowsPerColumn: number;
  setMaxRowsPerColumn: (maxRowsPerColumn: number) => void;

  // temporary information
  // alignBy: "center" | "topLeft";
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
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

      // temporary information
      // alignBy: "center",
      // Scale and rotation
      scale: 1,
      scalesMap: {},
      saveScaleForCurrentPlace: () => {
        const tablesStoreName = get().tablesStoreName;
        const scale = get().scale;

        // Extract place ID from the store name format: room-{placeId}-tables
        const match = tablesStoreName.match(/^room-(.+)-tables$/);
        if (match && match[1]) {
          const placeId = match[1];
          set((state) => ({
            scalesMap: {
              ...state.scalesMap,
              [placeId]: scale,
            },
          }));
        }
      },
      loadScaleForCurrentPlace: () => {
        const tablesStoreName = get().tablesStoreName;

        // Extract place ID from the store name format: room-{placeId}-tables
        const match = tablesStoreName.match(/^room-(.+)-tables$/);
        if (match && match[1]) {
          const placeId = match[1];
          const savedScale = get().scalesMap[placeId];
          if (savedScale) {
            set({ scale: savedScale });
          } else {
            set({ scale: 1 }); // Use default scale if no saved scale
          }
        }
      },
      setScale: (scale) => {
        set({ scale });
        get().saveScaleForCurrentPlace();
      },
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

      defaultMode: Mode.show,
      setDefaultMode: (mode) => set({ defaultMode: mode }),
      getDefaultMode: () => get().defaultMode,

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
      getStoreName: (storeName: string | undefined | null) => {
        if (!storeName) {
          return {
            designStoreName: DESIGN_STORE_NAME,
            tablesStoreName: TABLES_STORE_NAME,
          };
        }
        const baseName = storeName || "";
        const designStoreName = baseName
          ? `room-${baseName}-design`
          : DESIGN_STORE_NAME;
        const tablesStoreName = baseName
          ? `room-${baseName}-tables`
          : TABLES_STORE_NAME;

        return { designStoreName, tablesStoreName };
      },
      setStoreName: (storeName) => {
        const { designStoreName, tablesStoreName } =
          get().getStoreName(storeName);
        set({ designStoreName, tablesStoreName });

        // Load the scale for the current place when changing store name
        setTimeout(() => {
          get().loadScaleForCurrentPlace();
        }, 0);
      },
      resetRoom: (storeName: string | undefined | null) => {
        const { designStoreName, tablesStoreName } =
          get().getStoreName(storeName);
        // delete the data from the localStorage for this room
        try {
          // reset also the zustand stores
          const designStore = zustandDesignStore(designStoreName);
          const tableStore = zustandTableStore(tablesStoreName);

          if (designStore) designStore.getState().reset();
          if (tableStore) tableStore.getState().reset();

          // delete the data from the localStorage
          localStorage.removeItem(designStoreName);
          localStorage.removeItem(tablesStoreName);

          console.log(
            `[STORAGE] Data deleted for room: design=${designStoreName}, tables=${tablesStoreName}`
          );
          return true;
        } catch (error) {
          console.error(`[STORAGE] Error deleting data for room`, error);
          return false;
        }
      },

      // Layout
      maxRowsPerColumn: 10,
      setMaxRowsPerColumn: (maxRowsPerColumn) => set({ maxRowsPerColumn }),
    }),
    {
      name: "room-settings-storage",
      partialize: (state) => ({
        scalesMap: state.scalesMap,
        defaultMode: state.defaultMode,
        maxRowsPerColumn: state.maxRowsPerColumn,
      }),
    }
  )
);
