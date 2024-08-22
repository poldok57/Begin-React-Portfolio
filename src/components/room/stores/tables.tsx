// import React from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData } from "../types";

interface TableDataState {
  tables: TableData[];
  addTable: (table: TableData) => void;
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  deleteTable: (id: string) => void;
}

export const useTableDataStore = create<TableDataState>()(
  persist(
    (set) => ({
      tables: [],
      addTable: (table) =>
        set((state) => ({
          tables: [
            ...state.tables,
            {
              ...table,
              id:
                table.id ||
                `tbl_${Date.now().toString().slice(5, 11)}_${Math.random()
                  .toString(36)
                  .slice(2, 11)}`,
            },
          ],
        })),
      updateTable: (id, updatedTable) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id ? { ...table, ...updatedTable } : table
          ),
        })),
      deleteTable: (id) =>
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== id),
        })),
    }),
    {
      name: "table-data-storage",
    }
  )
);
