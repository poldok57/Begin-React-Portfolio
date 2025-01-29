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

const defaultDesignStoreName = "design-data-storage";

interface DesignState {
  designElements: ThingsToDraw[];
  selectedDesignElement: string | null;
  getDesignElementLength: () => number;
  backgroundColor: string;
  scale: number;
  getAllDesignElements: () => ThingsToDraw[];
  refreshCanvas: (
    ctx: CanvasRenderingContext2D | null | undefined,
    withSelected?: boolean,
    scale?: number | undefined | null
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
  orderDesignElement: (currentIndex: number, targetIndex: number) => void;
  eraseDesignElement: () => void;
  setScale: (scale: number) => void;
  // getScale: () => number;
  setBackgroundColor: (backgroundColor: string) => void;
}

const createDesignStore = (storageName: string) => {
  const designStore: StateCreator<DesignState> = (set, get) => ({
    designElements: [],
    selectedDesignElement: null,
    backgroundColor: "#ffffff",
    scale: 1,
    getAllDesignElements: () => get().designElements,
    refreshCanvas: (
      ctx: CanvasRenderingContext2D | null | undefined,
      withSelected: boolean = true,
      scale?: number | null
    ) => {
      if (!ctx || !ctx.canvas) return;

      if (scale === undefined || scale === null) {
        scale = get().scale;
      }

      const designElements = get().designElements;
      clearCanvasByCtx(ctx);
      if (ctx) {
        const selectedElementId = !withSelected
          ? get().getSelectedDesignElement()?.id
          : "-";
        designElements.forEach((element) => {
          if (element.id !== selectedElementId) {
            showDrawElement(ctx, element, scale, false);
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
        const lastElement =
          state.designElements[state.designElements.length - 1];
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
    orderDesignElement: (currentIndex: number, targetIndex: number) => {
      set((state: DesignState) => {
        const elements = [...state.designElements];

        if (
          currentIndex === -1 ||
          targetIndex < 0 ||
          targetIndex >= elements.length
        )
          return state;

        // Retirer l'élément de sa position actuelle
        const [movedElement] = elements.splice(currentIndex, 1);
        // L'insérer à sa nouvelle position
        elements.splice(targetIndex, 0, movedElement);

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
    setScale: (scale: number) => {
      set(() => ({
        scale,
      }));
    },
    // getScale: () => get().scale,
    setBackgroundColor: (backgroundColor: string) => {
      set(() => ({
        backgroundColor,
      }));
    },
    getDesignElementLength: () => get().designElements.length,
  });

  const localStoragePersist: PersistOptions<DesignState>["storage"] = {
    getItem: (key: string) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
    setItem: (key: string, value: StorageValue<DesignState>) => {
      if (value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.removeItem(key);
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  };

  return create<DesignState>()(
    persist(
      (set, get, api) => ({
        ...designStore(set, get, api),
      }),
      {
        name: storageName,
        storage: localStoragePersist,
      }
    )
  );
};

/**
 * Get the image data URL from localStorage
 * don't need to use zustand to get the image data URL
 * @param id - The id of the image
 * @returns The image data URL or null if not found
 */
export const getImageDataURL = (id: string) => {
  const imageKey = `img_${id}`;
  return localStorage.getItem(imageKey) ?? null;
};

export const useDesignStore = createDesignStore(defaultDesignStoreName);
export const useRoomDesignStore = createDesignStore("room-design-storage");

// Create a Map to store the instances of the stores
const storeInstances = new Map<string, ReturnType<typeof createDesignStore>>();

// For classes (non-React)
export const zustandDesignStore = (storeName: string | null) => {
  console.log("zustandDesignStore", storeName);
  const name = storeName ?? defaultDesignStoreName;

  // Get or create the store instance
  if (!storeInstances.has(name)) {
    storeInstances.set(name, createDesignStore(name));
  }

  return storeInstances.get(name)!;
};

// For React components
export const useZustandDesignStore = (storeName: string | null) => {
  if (storeName === null) {
    console.log("storeName is null");
    return null;
  }

  const store = zustandDesignStore(storeName);
  return store;
};
