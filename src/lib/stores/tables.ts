import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData } from "@/components/room/types";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { generateUniqueId } from "../utils/unique-id";
import { createLocalStoragePersist } from "@/lib/stores/persist";
import { Coordinate } from "../canvas/types";
// import { DesignType } from "../types";

const defaultTableStoreName = "table-data-storage";

export interface TableDataState {
  tables: TableData[];
  activeTable: string | null;
  setActiveTable: (id: string | null) => void;
  addTable: (table: TableData) => void;
  getTable: (id: string) => TableData | undefined;
  getSelectedTables: () => TableData[];
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  updateSelectedTables: (updatedTable: Partial<TableData>) => void;
  resetSelectedTables: () => void;
  selectOneTable: (id: string) => void;
  countSelectedTables: () => number;
  rotationSelectedTable: (angle: number) => void;
  sizeSelectedTable: (size: number) => void;
  deleteTable: (id: string) => void;
  deleteSelectedTable: () => void;
  getAllTables: () => TableData[];
  moveAllTables: (offset: Coordinate) => void;
}

interface TableDataWithIndex extends TableData {
  [key: string]: unknown;
}

const createTableStore = (storageName: string) => {
  const tableStore: StateCreator<TableDataState> = (set, get) => ({
    tables: [],
    activeTable: null,
    setActiveTable: (id) => set({ activeTable: id }),
    addTable: (table) => {
      const newTable = {
        ...table,
        id: table.id || generateUniqueId("tbl"),
      };
      set((state) => ({
        tables: [...state.tables, newTable],
      }));
      return newTable.id;
    },
    getTable: (id: string) => {
      return get().tables.find((table) => table.id === id);
    },
    getAllTables: () => {
      return get().tables;
    },
    getSelectedTables: () => {
      return get().tables.filter((table) => table.selected);
    },
    updateTable: (id, updatedTable) =>
      set(
        produce((state: TableDataState) => {
          const tableIndex = state.tables.findIndex(
            (table: TableData) => table.id === id
          );
          if (tableIndex !== -1) {
            const table = state.tables[tableIndex] as TableDataWithIndex;
            Object.entries(updatedTable).forEach(([key, value]) => {
              if (value !== undefined) {
                if (typeof value === "object" && value !== null) {
                  table[key] = { ...(table[key] || {}), ...value };
                } else {
                  table[key] = value;
                }
              }
            });
          } else {
            console.log("updateTable: table not found", id);
          }
        })
      ),
    updateSelectedTables: (updatedTable: Partial<TableData>) =>
      set((state) => ({
        tables: state.tables.map((table) =>
          table.selected ? { ...table, ...updatedTable } : table
        ),
      })),
    countSelectedTables: () => {
      return get().tables.filter((table) => table.selected).length;
    },
    resetSelectedTables: () =>
      set((state) => ({
        tables: state.tables.map((table) => ({
          ...table,
          selected: undefined,
          offset: undefined,
        })),
      })),
    selectOneTable: (id: string) =>
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === id
            ? { ...table, selected: true }
            : { ...table, selected: undefined }
        ),
      })),
    rotationSelectedTable: (angle: number) =>
      set((state) => ({
        tables: state.tables.map((table) =>
          table.selected
            ? { ...table, rotation: (table.rotation || 0) + angle }
            : table
        ),
      })),
    sizeSelectedTable: (size: number) =>
      set((state) => ({
        tables: state.tables.map((table) =>
          table.selected
            ? { ...table, size: (table.size || 100) + size }
            : table
        ),
      })),
    deleteTable: (id) =>
      set((state) => ({
        tables: state.tables.filter((table) => table.id !== id),
      })),
    deleteSelectedTable: () =>
      set((state) => ({
        tables: state.tables.filter((table) => !table.selected),
      })),
    moveAllTables: (offset: Coordinate) => {
      set((state) => {
        const updatedTables = state.tables.map((table) => ({
          ...table,
          position: {
            ...table.position,
            left: table.position.left + offset.x,
            top: table.position.top + offset.y,
          },
        }));

        return {
          tables: updatedTables,
        };
      });
    },
  });

  return create<TableDataState>()(
    persist(
      (set, get, api) => ({
        ...tableStore(set, get, api),
      }),
      {
        name: storageName,
        storage: createLocalStoragePersist<TableDataState>(),
      }
    )
  );
};
// Create a store for managing table data with persistence
// This store handles table selection, rotation, size, and deletion operations
// It uses Zustand for state management and local storage for persistence

// Export the default store for compatibility with existing code
export const useTableDataStore = createTableStore(defaultTableStoreName);

// Create a Map to store instances of the stores
const storeInstances = new Map<string, ReturnType<typeof createTableStore>>();

// For non-React classes
export const zustandTableStore = (storeName: string | null) => {
  const name = storeName ?? defaultTableStoreName;

  // Get or create the store instance
  if (!storeInstances.has(name)) {
    storeInstances.set(name, createTableStore(name));
  }

  return storeInstances.get(name)!;
};

// For React components
export const useZustandTableStore = (storeName: string | null) => {
  return zustandTableStore(storeName);
};
