/**
 * @file RoomExportImport.tsx
 * @description This file contains the RoomExportImport component, which allows the user to export and import Room data.
 * @author [@GuyRump](https://github.com/Poldok57) with Claude-37-Sonnet
 * @version 1.0.0
 */
import React, { useRef, useState } from "react";
import { Button } from "@/components/atom/Button";
import { Menu } from "../types";
import { useRoomStore } from "@/lib/stores/room";
import { usePlaceStore } from "@/lib/stores/places";
import {
  exportRoomData,
  importRoomData,
} from "@/lib/services/roomExportImport";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { menuRoomContainer, menuRoomVariants } from "@/styles/menu-variants";
import { Download, Upload, Save } from "lucide-react";

interface RoomExportImportMenuProps {
  handleClose: () => void;
}

const RoomExportImportMenu: React.FC<RoomExportImportMenuProps> = ({
  handleClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getCurrentPlaceId } = usePlaceStore();
  const currentPlaceId = getCurrentPlaceId();

  const handleExport = async () => {
    if (!currentPlaceId) {
      setMessage({ text: "Aucune Room sélectionnée", type: "error" });
      return;
    }

    try {
      setIsExporting(true);
      setMessage({ text: "Export en cours...", type: "info" });

      const fileName = await exportRoomData(currentPlaceId);

      setMessage({
        text: `Room exportée avec succès: ${fileName}`,
        type: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      setMessage({
        text: `Erreur lors de l'export: ${(error as Error).message}`,
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage({ text: "Import en cours...", type: "info" });

      await importRoomData(file);

      setMessage({ text: "Room importée avec succès", type: "success" });

      // Réinitialiser l'input file pour permettre de réimporter le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Fermer le menu après un import réussi
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      setMessage({
        text: `Erreur lors de l'import: ${(error as Error).message}`,
        type: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={menuRoomVariants({ width: 72 })}>
      <h2 className="p-2 text-xl font-bold text-center">
        Export / Import Room
      </h2>

      {message && (
        <div
          className={`p-2 mb-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {currentPlaceId && (
          <>
            <Button
              onClick={handleExport}
              disabled={isExporting || !currentPlaceId}
              className="flex gap-2 justify-center items-center bg-primary"
            >
              <Download size={18} />
              {isExporting ? "Exporting..." : "Export current Room"}
            </Button>
          </>
        )}

        <Button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex gap-2 justify-center items-center bg-secondary"
        >
          <Upload size={18} />
          {isImporting ? "Importing..." : "Import Room"}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      <div className="flex justify-center p-2 mt-4">
        <Button onClick={handleClose} className="bg-warning">
          Close
        </Button>
      </div>
    </div>
  );
};

const RoomExportImportMenuWP = withMousePosition(RoomExportImportMenu);

interface RoomExportImportProps {
  className: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const RoomExportImport: React.FC<RoomExportImportProps> = ({
  className,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode, defaultMode } = useRoomStore();
  const { getCurrentPlace } = usePlaceStore();
  const currentPlace = getCurrentPlace();

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          className={className}
          onClick={() => {
            setActiveMenu(Menu.exportImport);
            setMode(defaultMode);
          }}
          selected={activeMenu === Menu.exportImport}
          disabled={disabled}
          title={!currentPlace ? "Select a Room first" : "Export/Import a Room"}
        >
          <Save size={18} />
          Export/Import
        </Button>
      </div>

      {activeMenu === Menu.exportImport && (
        <RoomExportImportMenuWP
          onClose={() => setActiveMenu(null)}
          handleClose={() => setActiveMenu(null)}
          className={menuRoomContainer({ className: "fit" })}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Export / Import de Room"
          titleHidden={false}
          titleBackground={"#6699ee"}
          draggable={true}
        />
      )}
    </>
  );
};
