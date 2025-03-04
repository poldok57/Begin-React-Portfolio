import { create } from "zustand";
import { PlaceRoom } from "@/components/room/types";
import { persist } from "zustand/middleware";
import { generateUniqueId } from "../utils/unique-id";

interface PlaceStore {
  places: PlaceRoom[];
  addPlace: (place: PlaceRoom) => void;
  updatePlace: (id: string, place: Partial<PlaceRoom>) => void;
  addOrUpdatePlace: (place: PlaceRoom) => void;
  deletePlace: (id: string) => void;
  getPlace: (id: string) => PlaceRoom | undefined;
  clearPlaces: () => void;
}

export const usePlaceStore = create<PlaceStore>()(
  persist(
    (set, get) => ({
      places: [],

      addPlace: (place) => {
        place.id = generateUniqueId("p", true);
        set((state) => ({
          places: [...state.places, place],
        }));
      },

      updatePlace: (id, place) => {
        set((state) => ({
          places: state.places.map((p) =>
            p.id === id ? { ...p, ...place } : p
          ),
        }));
      },
      addOrUpdatePlace: (place: PlaceRoom) => {
        if (place.id) {
          get().updatePlace(place.id, place);
        } else {
          get().addPlace(place);
        }
      },

      deletePlace: (id) => {
        set((state) => ({
          places: state.places.filter((p) => p.id !== id),
        }));
      },

      getPlace: (id) => {
        return get().places.find((p) => p.id === id);
      },

      clearPlaces: () => {
        set({ places: [] });
      },
    }),
    {
      name: "placeroom-storage",
    }
  )
);
