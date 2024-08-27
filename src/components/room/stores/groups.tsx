// import React from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GroupTable } from "../types";

interface GroupState {
  groups: GroupTable[];
  addGroup: (group: GroupTable) => string;
  updateGroup: (id: string, updatedGroup: Partial<GroupTable>) => void;
  deleteGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [] as GroupTable[],
      addGroup: (group) => {
        const newGroup = {
          ...group,
          id:
            group.id ||
            `grp_${Date.now().toString().slice(5, 11)}_${Math.random()
              .toString(36)
              .slice(2, 11)}`,
        };
        set((state) => ({
          groups: [...state.groups, newGroup],
        }));
        return newGroup.id; // Retourne l'ID du groupe créé
      },
      updateGroup: (id, updatedGroup) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...updatedGroup } : group
          ),
        })),
      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        })),
    }),
    {
      name: "group-storage",
    }
  )
);
