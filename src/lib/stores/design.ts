import { create } from "zustand";
import { persist, StorageValue, PersistOptions } from "zustand/middleware";
import { StateCreator } from "zustand";

import {
  ThingsToDraw,
  DRAW_TYPE,
  ShapeDefinition,
} from "../canvas/canvas-defines";
import { generateUniqueId } from "../utils/unique-id";
import { showDrawElement } from "../canvas/showDrawElement";
import { clearCanvasByCtx } from "../canvas/canvas-tools";

interface DesignState {
  designElements: ThingsToDraw[];
  selectedDesignElement: string | null;
  scale: number;
  getAllDesignElements: () => ThingsToDraw[];
  refreshCanvas: (
    ctx: CanvasRenderingContext2D | null | undefined,
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
  getImageDataURL: (id: string) => string | null;
  setScale: (scale: number) => void;
  getScale: () => number;
}

const designStore: StateCreator<DesignState> = (set, get) => ({
  designElements: [],
  selectedDesignElement: null,
  scale: 1,
  getAllDesignElements: () => get().designElements,
  refreshCanvas: (
    ctx: CanvasRenderingContext2D | null | undefined,
    withSelected: boolean = true
  ) => {
    if (!ctx || !ctx.canvas) return;

    const designElements = get().designElements;
    clearCanvasByCtx(ctx);
    if (ctx) {
      const selectedElementId = !withSelected
        ? get().getSelectedDesignElement()?.id
        : "-";
      designElements.forEach((element) => {
        if (element.id !== selectedElementId) {
          showDrawElement(ctx, element, get().getScale(), false);
        }
      });
    }
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
    // If element is an image, store its dataURL in localStorage
    if (
      designElement.type === DRAW_TYPE.IMAGE &&
      (designElement as ShapeDefinition).dataURL
    ) {
      const imageKey = `img_${newDesignElement.id}`;
      localStorage.setItem(
        imageKey,
        (designElement as ShapeDefinition).dataURL ?? ""
      );
      // Remove dataURL from the element to avoid storing it twice
      delete (newDesignElement as ShapeDefinition).dataURL;
    }

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
    set((state: DesignState) => {
      // Trouver l'élément avant de le supprimer pour vérifier son type
      const element = state.designElements.find((el) => el.id === id);

      // Si c'est une image, nettoyer le localStorage
      if (element?.type === DRAW_TYPE.IMAGE) {
        const imageKey = `img_${id}`;
        localStorage.removeItem(imageKey);
      }

      return {
        designElements: state.designElements.filter(
          (designElement) => designElement.id !== id
        ),
      };
    }),
  deleteLastDesignElement: () =>
    set((state: DesignState) => {
      // Vérifier si le dernier élément est une image
      const lastElement = state.designElements[state.designElements.length - 1];
      if (lastElement?.type === DRAW_TYPE.IMAGE) {
        const imageKey = `img_${lastElement.id}`;
        localStorage.removeItem(imageKey);
      }

      return {
        designElements: state.designElements.slice(0, -1),
      };
    }),
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
    set((state: DesignState) => {
      // Nettoyer le localStorage pour toutes les images
      state.designElements.forEach((element) => {
        if (element.type === DRAW_TYPE.IMAGE) {
          const imageKey = `img_${element.id}`;
          localStorage.removeItem(imageKey);
        }
      });

      return {
        designElements: [],
      };
    });
  },
  getImageDataURL: (id: string) => {
    const imageKey = `img_${id}`;
    return localStorage.getItem(imageKey) ?? null;
  },
  setScale: (scale: number) => {
    set(() => ({
      scale,
    }));
  },
  getScale: () => get().scale,
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
