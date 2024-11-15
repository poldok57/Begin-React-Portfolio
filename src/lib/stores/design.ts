import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";

import { ThingsToDraw, DRAW_TYPE } from "../canvas/canvas-defines";
import { generateUniqueId } from "../utils/unique-id";

interface DesignState {
  designElements: ThingsToDraw[];
  selectedDesignElement: string | null;
  getDesignElement: (id: string) => ThingsToDraw | undefined;
  addDesignElement: (designElement: ThingsToDraw) => void;
  deleteDesignElement: (id: string) => void;
  deleteDesignElementByType: (
    type: (typeof DRAW_TYPE)[keyof typeof DRAW_TYPE]
  ) => void;
  updateDesignElement: (designElement: ThingsToDraw) => void;
  setSelectedDesignElement: (id: string | null) => void;
}

const designStore: StateCreator<DesignState> = (set, get) => ({
  designElements: [],
  selectedDesignElement: null,
  getDesignElement: (id: string) =>
    get().designElements.find(
      (designElement: ThingsToDraw) => designElement.id === id
    ),
  addDesignElement: (designElement: ThingsToDraw) => {
    const newDesignElement = {
      ...designElement,
      id: designElement.id || generateUniqueId("des"),
    };
    set((state: DesignState) => ({
      designElements: [...state.designElements, newDesignElement],
    }));
    return newDesignElement.id;
  },
  updateDesignElement: (designElement: ThingsToDraw) => {
    set((state: DesignState) => ({
      designElements: state.designElements.map((element) =>
        element.id === designElement.id ? designElement : element
      ),
    }));
  },
  deleteDesignElement: (id: string) =>
    set((state: DesignState) => ({
      designElements: state.designElements.filter(
        (designElement) => designElement.id !== id
      ),
    })),
  deleteDesignElementByType: (
    type: (typeof DRAW_TYPE)[keyof typeof DRAW_TYPE]
  ) =>
    set((state: DesignState) => ({
      designElements: state.designElements.filter(
        (designElement) => designElement.type !== type
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

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get, api) => ({
      ...designStore(set, get, api),
    }),
    {
      name: "design-data-storage",
      getStorage: () => localStorage,
    }
  )
);
