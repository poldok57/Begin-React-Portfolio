import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData, DesignElement } from "../types";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { generateUniqueId } from "./unique-id";

interface TableDataState {
  tables: TableData[];
  designElements: DesignElement[];
  selectedDesignElement: string | null;
  addTable: (table: TableData) => void;
  getTable: (id: string) => TableData | undefined;
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  updateSelectedTable: (updatedTable: Partial<TableData>) => void;
  countSelectedTables: () => number;
  rotationSelectedTable: (angle: number) => void;
  sizeSelectedTable: (size: number) => void;
  deleteTable: (id: string) => void;
  deleteSelectedTable: () => void;
  addDesignElement: (designElement: DesignElement) => void;
  deleteDesignElement: (id: string) => void;
  setSelectedDesignElement: (id: string | null) => void;
}

interface TableDataWithIndex extends TableData {
  [key: string]: unknown;
}

const tableStore: StateCreator<TableDataState> = (set, get) => ({
  tables: [],
  designElements: [],
  selectedDesignElement: null,
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
  updateSelectedTable: (updatedTable: Partial<TableData>) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.selected ? { ...table, ...updatedTable } : table
      ),
    })),
  countSelectedTables: () => {
    return get().tables.filter((table) => table.selected).length;
  },
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
  addDesignElement: (designElement: DesignElement) => {
    const newDesignElement = {
      ...designElement,
      id: designElement.id || generateUniqueId("des"),
    };
    set((state: TableDataState) => ({
      designElements: [...state.designElements, newDesignElement],
    }));
    return newDesignElement.id;
  },
  deleteDesignElement: (id: string) =>
    set((state: TableDataState) => ({
      designElements: state.designElements.filter(
        (designElement) => designElement.id !== id
      ),
    })),
  setSelectedDesignElement: (id: string | null) =>
    set(() => ({
      selectedDesignElement: id,
    })),
});

// export const useTableDataStore = create<TableDataState>()(
//   persist(tableStore, {
//     name: "table-data-storage",
//     getStorage: () => localStorage,
//   })
// );

export const useTableDataStore = create<TableDataState>()(
  persist(
    (set, get, api) => ({
      ...tableStore(set, get, api),
    }),
    {
      name: "table-data-storage",
      getStorage: () => localStorage,
    }
  )
);
