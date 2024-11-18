import { create } from "zustand";
import { persist, StorageValue, PersistOptions } from "zustand/middleware";
import { StateCreator } from "zustand";

import { ThingsToDraw, DRAW_TYPE } from "../canvas/canvas-defines";
import { generateUniqueId } from "../utils/unique-id";
import { showDrawElement } from "../canvas/showDrawElement";

interface DesignState {
  designElements: ThingsToDraw[];
  selectedDesignElement: string | null;
  getAllDesignElements: () => ThingsToDraw[];
  refreshCanvas: (
    ctx: CanvasRenderingContext2D | null,
    withSelected?: boolean
  ) => void;
  getDesignElement: (id: string) => ThingsToDraw | undefined;
  addDesignElement: (designElement: ThingsToDraw) => string;
  deleteDesignElement: (id: string) => void;
  deleteLastDesignElement: () => void;
  deleteDesignElementByType: (
    type: (typeof DRAW_TYPE)[keyof typeof DRAW_TYPE]
  ) => void;
  updateDesignElement: (designElement: ThingsToDraw) => void;
  setSelectedDesignElement: (id: string | null) => void;
  getSelectedDesignElement: () => ThingsToDraw | null;
  addOrUpdateDesignElement: (designElement: ThingsToDraw) => string;
  orderDesignElement: (id: string, direction: 1 | -1) => void;
  eraseDesignElement: () => void;
}

const designStore: StateCreator<DesignState> = (set, get) => ({
  designElements: [],
  selectedDesignElement: null,
  getAllDesignElements: () => get().designElements,
  refreshCanvas: (
    ctx: CanvasRenderingContext2D | null,
    withSelected: boolean = true
  ) => {
    const designElements = get().designElements;
    if (!ctx) return;

    const selectedElementId = !withSelected
      ? get().getSelectedDesignElement()?.id
      : "-";
    // console.log("selectedElementId", selectedElementId);
    // console.log("clear ", ctx.canvas.width, ctx.canvas.height);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    designElements.forEach((element) => {
      if (element.id !== selectedElementId) {
        showDrawElement(ctx, element, false);
      }
    });
  },
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
  addOrUpdateDesignElement: (designElement: ThingsToDraw) => {
    if (designElement.id) {
      const existingElement = get().getDesignElement(designElement.id);
      if (existingElement) {
        get().updateDesignElement(designElement);
        return designElement.id;
      }
    }
    return get().addDesignElement(designElement);
  },
  deleteDesignElement: (id: string) =>
    set((state: DesignState) => ({
      designElements: state.designElements.filter(
        (designElement) => designElement.id !== id
      ),
    })),
  deleteLastDesignElement: () =>
    set((state: DesignState) => ({
      designElements: state.designElements.slice(0, -1),
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
  getSelectedDesignElement: () => {
    const selectedDesignElement = get().selectedDesignElement;
    if (selectedDesignElement) {
      return get().getDesignElement(selectedDesignElement) ?? null;
    }
    return null;
  },
  orderDesignElement: (id: string, direction: 1 | -1) => {
    set((state: DesignState) => {
      const elements = [...state.designElements];
      const currentIndex = elements.findIndex((element) => element.id === id);

      if (currentIndex === -1) return state;

      const newIndex = currentIndex + direction;
      if (newIndex < 0 || newIndex >= elements.length) return state;

      // Swap elements
      [elements[currentIndex], elements[newIndex]] = [
        elements[newIndex],
        elements[currentIndex],
      ];

      return {
        designElements: elements,
      };
    });
  },
  eraseDesignElement: () => {
    set(() => ({
      designElements: [],
    }));
  },
});

const localStoragePersist: PersistOptions<DesignState>["storage"] = {
  getItem: (key: string) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null; // Deserialize the data
  },
  setItem: (key: string, value: StorageValue<DesignState>) => {
    if (value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value)); // Serialize the data
    } else {
      localStorage.removeItem(key); // Remove if the value is undefined
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get, api) => ({
      ...designStore(set, get, api),
    }),
    {
      name: "design-data-storage",
      storage: localStoragePersist, // Use the custom storage
    }
  )
);
