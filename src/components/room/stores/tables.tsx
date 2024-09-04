import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData, DesignElement } from "../types";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { generateUniqueId } from "./unique-id";

interface TableDataState {
  tables: TableData[];
  addTable: (table: TableData) => void;
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  updateSelectedTable: (updatedTable: Partial<TableData>) => void;
  rotationSelectedTable: (angle: number) => void;
  sizeSelectedTable: (size: number) => void;
  deleteTable: (id: string) => void;
  designElements: DesignElement[];
  addDesignElement: (designElement: DesignElement) => void;
  deleteDesignElement: (id: string) => void;
}

interface TableDataWithIndex extends TableData {
  [key: string]: unknown;
}

const tableStore: StateCreator<TableDataState> = (set) => ({
  tables: [],
  designElements: [],
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
