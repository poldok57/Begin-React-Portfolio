import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData } from "../types";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { generateUniqueId } from "../../../lib/utils/unique-id";
import { createLocalStoragePersist } from "@/lib/stores/persist";
// import { DesignType } from "../types";
interface TableDataState {
  tables: TableData[];
  activeTable: string | null;
  setActiveTable: (id: string | null) => void;
  addTable: (table: TableData) => void;
  getTable: (id: string) => TableData | undefined;
  getSelectedTables: () => TableData[];
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  updateSelectedTables: (updatedTable: Partial<TableData>) => void;
  resetSelectedTables: () => void;
  countSelectedTables: () => number;
  rotationSelectedTable: (angle: number) => void;
  sizeSelectedTable: (size: number) => void;
  deleteTable: (id: string) => void;
  deleteSelectedTable: () => void;
  getTables: () => TableData[];
}

interface TableDataWithIndex extends TableData {
  [key: string]: unknown;
}

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
  getTables: () => {
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
        selected: false,
        offset: undefined,
      })),
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
        table.selected ? { ...table, size: (table.size || 100) + size } : table
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
});

export const useTableDataStore = create<TableDataState>()(
  persist(
    (set, get, api) => ({
      ...tableStore(set, get, api),
    }),
    {
      name: "table-data-storage",
      storage: createLocalStoragePersist<TableDataState>(),
    }
  )
);
