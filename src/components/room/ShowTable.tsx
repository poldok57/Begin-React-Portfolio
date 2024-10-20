import React, { useState, useEffect } from "react";
import { TableColors, TableSettings, TableType } from "./types";
import { PokerTable } from "./svg/PokerTable";
import { RouletteTable } from "./svg/RouletteTable";
import { SymetricTable } from "./svg/SymetricTable";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { RangeInput } from "@/components/atom/RangeInput";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Settings,
  Save,
  ListRestart,
  PencilOff,
} from "lucide-react";
import SettingsOff from "@/components/atom/svg/SettingsOff";
import clsx from "clsx";
import { SelectTableType } from "./SelectTableType";

const DEFAULT_SETTINGS = {
  widthLine: 0.025,
  heightRatio: 0.28,
  concaveRatio: 0.07,
  textRatio: 0.3,
  opacity: 0.4,
};

export const getTableComponent = (tableType: TableType) => {
  return tableType === TableType.poker
    ? PokerTable
    : tableType === TableType.roulette || tableType === TableType.rouletteL
    ? RouletteTable
    : SymetricTable;
};

interface ShowTableProps {
  colors?: TableColors | null;
  settings?: TableSettings | null;
  title: string | undefined;
  tableType?: TableType;
  setTableType: (tableType: TableType) => void;
  saveSettings: (settings: TableSettings) => void;
  resetTable?: () => void;
  handleRotation?: (rotation: number) => void;
  handleSize?: (size: number) => void;
  onClose?: () => void;
  isTouch: boolean;
  editing?: boolean;
  className?: string;
  rotation?: number;
  rotationStep?: number;
  size?: number;
  sizeStep?: number;
  tableNumber?: string;
  flashDuration?: number;
  bgTable?: string;
}
export const ShowTable: React.FC<ShowTableProps> = ({
  colors,
  settings,
  title,
  tableType = TableType.poker,
  setTableType,
  saveSettings,
  resetTable,
  isTouch,
  onClose,
  editing = false,
  className,
  rotation = 0,
  rotationStep = 15,
  size = 200,
  sizeStep = 10,
  handleRotation,
  handleSize,
  tableNumber = "88",
  flashDuration = 0,
  bgTable,
}) => {
  // states for size and rotation
  const [_size, setSize] = useState(size);
  const [_rotation, setRotation] = useState(rotation);
  const [_flashDuration, setFlashDuration] = useState(flashDuration);
  const [openSettings, setOpenSettings] = useState(editing);
  const [tableSettings, setTableSettings] =
    useState<TableSettings>(DEFAULT_SETTINGS);
  const btnSize = isTouch ? 20 : 16;
  const handleSettingsChange = (name: string, value: number) => {
    // console.log("name:", name, "value:", value);
    setTableSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };
  // Fonctions pour modifier la rotation et la taille
  const changeRotation = (increment: number) => {
    const newRotation = (_rotation + increment + 360) % 360;
    setRotation(newRotation);
    handleRotation && handleRotation(newRotation);
  };

  const changeSize = (increment: number) => {
    const newSize = Math.max(50, Math.min(500, _size + increment));
    setSize(newSize);
    handleSize && handleSize(newSize);
  };

  useEffect(() => {
    setTableSettings(settings || DEFAULT_SETTINGS);
  }, [settings, tableType]);

  const TableComponent = getTableComponent(tableType);

  return (
    <div
      className={clsx(
        "flex flex-col gap-1 items-center border border-red",
        className
      )}
      onMouseOver={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <div className="flex z-[1] mx-3 justify-between border-b-2 border-gray-200 pb-1 w-full">
        <div className="flex flex-row gap-4">
          <button
            onClick={() => changeRotation(-rotationStep)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <RotateCcw size={btnSize} />
          </button>
          <button
            onClick={() => changeRotation(rotationStep)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <RotateCw size={btnSize} />
          </button>
        </div>
        <RangeInput
          className="w-24 h-4"
          id="flashDuration"
          label="Flash duration"
          value={_flashDuration || 0}
          min="0"
          max="10"
          step="0.5"
          onChange={(v) => setFlashDuration(v)}
          isTouch={isTouch}
        />
        <div className="flex flex-row gap-4">
          <button
            onClick={() => changeSize(-sizeStep)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <Minus size={btnSize} />
          </button>
          <button
            onClick={() => changeSize(sizeStep)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <Plus size={btnSize} />
          </button>
        </div>
      </div>
      <div
        className={clsx(
          [
            "flex flex-col p-2 mx-3 min-w-full w-fit z-[1]",
            "transition-all duration-300 ease-in-out",
          ],
          {
            "rounded-lg border border-gray-400 shadow-lg bg-paper":
              openSettings,
            "mb-10": openSettings,
            "-mb-5": !openSettings,
          }
        )}
      >
        <div className="flex flex-row gap-2 justify-between mb-3 w-full">
          <button
            onClick={() => setOpenSettings(!openSettings)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
            })}
          >
            {openSettings ? (
              <SettingsOff size={btnSize} />
            ) : (
              <Settings size={btnSize} />
            )}
          </button>
          <SelectTableType tableType={tableType} setTableType={setTableType} />
          {onClose && !openSettings && (
            <button
              className={clsx("btn btn-circle", {
                "btn-sm": !isTouch,
              })}
              onClick={onClose}
            >
              <PencilOff size={btnSize} />
            </button>
          )}
          <div
            className={clsx("flex relative flex-row gap-4", {
              hidden: !openSettings,
            })}
          >
            {resetTable && (
              <DeleteWithConfirm
                confirmClassName="p-2 m-1 btn btn-sm"
                className={clsx("btn btn-circle", {
                  "btn-sm": !isTouch,
                  "btn-md": isTouch,
                })}
                position="top"
                confirmMessage="Reset table?"
                onConfirm={() => {
                  resetTable();
                }}
              >
                <ListRestart size={btnSize} />
              </DeleteWithConfirm>
            )}
            <button
              className={clsx("btn btn-circle", {
                "btn-sm": !isTouch,
                hidden: !openSettings,
              })}
              title="Save settings"
              onClick={() => saveSettings(tableSettings)}
            >
              <Save size={btnSize} />
            </button>
          </div>
        </div>
        <div
          className={clsx("flex flex-row gap-2 justify-between pt-2 w-full", {
            hidden: !openSettings,
          })}
        >
          <RangeInput
            className="w-20 h-4"
            id="widthLine"
            label="Line"
            value={tableSettings.widthLine || 0}
            min="0.01"
            max="0.08"
            step="0.005"
            onChange={(v) => handleSettingsChange("widthLine", v)}
            isTouch={isTouch}
          />
          <RangeInput
            className="w-20 h-4"
            id="heightRatio"
            label="Height"
            value={tableSettings.heightRatio || 0}
            min="0.24"
            max="0.36"
            step="0.02"
            onChange={(v) => handleSettingsChange("heightRatio", v)}
            isTouch={isTouch}
          />
          <RangeInput
            className="w-20 h-4"
            id="textRatio"
            label="Text size"
            value={tableSettings.textRatio || 0}
            min="0.1"
            max="0.4"
            step="0.01"
            onChange={(v) => handleSettingsChange("textRatio", v)}
            isTouch={isTouch}
          />
        </div>
        <div
          className={clsx("flex flex-row gap-2 justify-between w-full", {
            hidden: !openSettings,
          })}
        >
          <RangeInput
            className="w-20 h-4"
            id="concaveRatio"
            label="Concave (Dealer)"
            value={tableSettings.concaveRatio || 0}
            min="0.00"
            max="0.14"
            step="0.01"
            onChange={(v) => handleSettingsChange("concaveRatio", v)}
            isTouch={isTouch}
          />

          <RangeInput
            className="w-20 h-4"
            id="opacity"
            label="Details opacity"
            value={tableSettings.opacity || 0}
            min="0"
            max="1"
            step="0.01"
            onChange={(v) => handleSettingsChange("opacity", v)}
            isTouch={isTouch}
          />
        </div>
      </div>

      <TableComponent
        size={_size}
        rotation={_rotation}
        {...colors}
        {...tableSettings}
        flashDuration={_flashDuration}
        tableNumber={tableNumber}
        tableText={title}
        type={tableType}
        style={{
          zIndex: 2,
          backgroundColor: bgTable,
        }}
      />
    </div>
  );
};
