//  Function to store an image in IndexedDB
export const storeImageInIndexedDB = async (
  id: string,
  imageData: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("designImages", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["images"], "readwrite");
      const store = transaction.objectStore("images");

      const putRequest = store.put({ id, data: imageData });

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = (error) => {
        console.error(
          `[IndexedDB] Erreur lors du stockage de l'image ${id}`,
          error
        );
        reject(error);
      };

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = (error) => {
        console.error(`[IndexedDB] Erreur de transaction pour ${id}`, error);
        reject(error);
      };
    };

    request.onerror = (error) => {
      console.error(
        `[IndexedDB] Erreur d'ouverture de la base de données`,
        error
      );
      reject(error);
    };
  });
};

//  Function to get an image from IndexedDB
export const getImageFromIndexedDB = async (
  id: string
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("designImages", 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Vérifier si le magasin d'objets existe
      if (!db.objectStoreNames.contains("images")) {
        db.close();
        resolve(null);
        return;
      }

      const transaction = db.transaction(["images"], "readonly");
      const store = transaction.objectStore("images");

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result.data);
        } else {
          resolve(null);
        }
        db.close();
      };

      getRequest.onerror = (error) => {
        console.error(
          `[IndexedDB] Erreur lors de la récupération de l'image ${id}`,
          error
        );
        db.close();
        reject(error);
      };
    };

    request.onerror = (error) => {
      console.error(
        `[IndexedDB] Erreur d'ouverture de la base de données pour la lecture`,
        error
      );
      reject(error);
    };
  });
};

// Add this function to clean up images
export const cleanupImageStorage = async (id: string): Promise<void> => {
  const imageKey = `img_${id}`;

  try {
    // Supprimer de IndexedDB
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("designImages", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error(
          `[IndexedDB] Erreur d'ouverture pour suppression`,
          request.error
        );
        reject(request.error);
      };
    });

    if (db.objectStoreNames.contains("images")) {
      const transaction = db.transaction(["images"], "readwrite");
      const store = transaction.objectStore("images");
      const deleteRequest = store.delete(imageKey);

      deleteRequest.onsuccess = () => {
        // console.log(`[IndexedDB] Image ${imageKey} supprimée avec succès`);
      };

      deleteRequest.onerror = (error) => {
        console.error(
          `[IndexedDB] Erreur lors de la suppression de ${imageKey}`,
          error
        );
      };
    }
  } catch (error) {
    console.warn(
      `[IndexedDB] Échec de suppression depuis IndexedDB pour ${imageKey}`,
      error
    );
  }

  // Supprimer aussi de localStorage
  try {
    localStorage.removeItem(imageKey);
  } catch (error) {
    console.error(
      `[STORAGE] Erreur lors de la suppression du localStorage pour ${imageKey}`,
      error
    );
  }
};
