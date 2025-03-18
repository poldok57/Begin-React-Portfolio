// import React from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GroupTable } from "@/components/room/types";
import { generateUniqueId } from "../utils/unique-id";

interface GroupState {
  groups: GroupTable[];
  getGroup: (id: string) => GroupTable | undefined;
  addGroup: (group: GroupTable) => string;
  updateGroup: (id: string, updatedGroup: Partial<GroupTable>) => void;
  deleteGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [] as GroupTable[],
      addGroup: (group) => {
        const newGroup = {
          ...group,
          id: group.id || generateUniqueId("grp"),
        };
        set((state) => ({
          groups: [...state.groups, newGroup],
        }));
        return newGroup.id; // Retourne l'ID du groupe créé
      },
      getGroup: (id: string) => {
        return get().groups.find((group) => group.id === id);
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
