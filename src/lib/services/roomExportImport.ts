/*
 * @file roomExportImport.ts
 * @author [@GuyRump](https://github.com/Poldok57) with Claude-37-Sonnet
 * @description This file contains the RoomExportImport component, which allows the user to export and import Room data.
 * @version 1.0.0
 */
import { zustandTableStore } from "../stores/tables";
import { zustandDesignStore, getImageDataURL } from "../stores/design";
import { usePlaceStore } from "../stores/places";
import { useRoomStore } from "../stores/room";
import { storeImageInIndexedDB } from "../stores/indexedDBstore";
import { PlaceRoom } from "@/components/room/types";
import { ThingsToDraw } from "../canvas/canvas-defines";
import { TableData } from "@/components/room/types";

// Structure du fichier d'export
interface RoomExportData {
  version: string;
  exportDate: string;
  place: PlaceRoom;
  tables: TableData[];
  design: {
    elements: ThingsToDraw[];
    backgroundColor: string;
    scale: number;
    images: {
      id: string;
      dataURL: string;
    }[];
  };
}

/**
 * Export the data of a Room in a JSON file
 * @param placeId - ID of the Room to export
 * @returns Promise<string> - Name of the generated file
 */
export const exportRoomData = async (placeId: string): Promise<string> => {
  try {
    // 1. Get the information of the Room
    const placeStore = usePlaceStore.getState();
    const place = placeStore.getPlace(placeId);

    if (!place) {
      throw new Error(`Room with the ID ${placeId} not found`);
    }

    // 2. Get the names of the stores for this Room
    const roomStore = useRoomStore.getState();
    const { designStoreName, tablesStoreName } =
      roomStore.getStoreName(placeId);

    // 3. Get the data of the tables
    const tableStore = zustandTableStore(tablesStoreName);
    const tables = tableStore.getState().tables;

    // 4. Get the data of the design
    const designStore = zustandDesignStore(designStoreName);
    const designState = designStore.getState();
    const designElements = designState.designElements;
    const backgroundColor = designState.backgroundColor;
    const scale = designState.scale;

    // 5. Get the images of the design from IndexedDB
    const imagePromises = designElements
      .filter((element) => element.type === "image")
      .map(async (element) => {
        const dataURL = await getImageDataURL(element.id);
        return {
          id: element.id,
          dataURL: dataURL || "",
        };
      });

    const images = await Promise.all(imagePromises);

    // 6. Create the export object
    const exportData: RoomExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      place,
      tables,
      design: {
        elements: designElements,
        backgroundColor,
        scale,
        images,
      },
    };

    // 7. Convert to JSON and create a Blob
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    // 8. Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `room_${place.name.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return fileName;
  } catch (error) {
    console.error("Error exporting the Room:", error);
    throw error;
  }
};

/**
 * Import the data of a Room from a JSON file
 * @param file - JSON file containing the Room data
 * @returns Promise<string> - ID of the imported Room
 */
export const importRoomData = async (file: File): Promise<string> => {
  try {
    // 1. Read the content of the file
    const fileContent = await file.text();
    const importData: RoomExportData = JSON.parse(fileContent);

    // 2. Check the version of the file
    if (!importData.version) {
      throw new Error("Invalid file format");
    }

    // 3. Get the stores
    const placeStore = usePlaceStore.getState();
    const roomStore = useRoomStore.getState();

    // 4. Create a new place with a new ID (to avoid conflicts)
    const place = { ...importData.place };

    // 5. Check if a place with the same name already exists
    const existingPlace = placeStore.places.find((p) => p.name === place.name);
    if (existingPlace) {
      // Add a suffix to the name to avoid duplicates
      place.name = `${place.name} (imported)`;
    }

    // 6. Add the place to the store
    placeStore.addPlace(place);

    // 7. Get the names of the stores for this place
    const { designStoreName, tablesStoreName } = roomStore.getStoreName(
      place.id
    );

    // 8. Import the tables
    const tableStore = zustandTableStore(tablesStoreName);
    // Reset the store before importing
    tableStore.getState().reset();

    // Add each table
    for (const table of importData.tables) {
      tableStore.getState().addTable(table);
    }

    // 9. Import the design
    const designStore = zustandDesignStore(designStoreName);
    // Reset the store before importing
    await designStore.getState().reset();

    // Set the base properties
    designStore
      .getState()
      .setBackgroundColor(importData.design.backgroundColor);
    designStore.getState().setScale(importData.design.scale);

    // 10. Import the images in IndexedDB
    for (const image of importData.design.images) {
      if (image.dataURL) {
        const imageKey = `img_${image.id}`;
        await storeImageInIndexedDB(imageKey, image.dataURL);
      }
    }

    // 11. Add the design elements
    for (const element of importData.design.elements) {
      await designStore.getState().addDesignElement(element);
    }

    // 12. Set the current place
    placeStore.setCurrentPlaceId(place.id);

    return place.id;
  } catch (error) {
    console.error("Error importing the Room:", error);
    throw error;
  }
};
