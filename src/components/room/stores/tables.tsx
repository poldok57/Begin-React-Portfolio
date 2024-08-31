// import React from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableData } from "../types";

interface TableDataState {
  tables: TableData[];
  addTable: (table: TableData) => void;
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  updateSelectedTable: (updatedTable: Partial<TableData>) => void;
  rotationSelectedTable: (angle: number) => void;
  sizeSelectedTable: (size: number) => void;
  deleteTable: (id: string) => void;
}

export const useTableDataStore = create<TableDataState>()(
  persist(
    (set) => ({
      tables: [],
      addTable: (table) => {
        const newTable = {
          ...table,
          id:
            table.id ||
            `tbl_${Date.now().toString().slice(5, 11)}_${Math.random()
              .toString(36)
              .slice(2, 11)}`,
        };
        set((state) => ({
          tables: [...state.tables, newTable],
        }));
        return newTable.id;
      },
      updateTable: (id, updatedTable) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id ? { ...table, ...updatedTable } : table
          ),
        })),
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
            table.selected
              ? { ...table, size: (table.size || 100) + size }
              : table
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
