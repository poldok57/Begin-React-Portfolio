import React, { useState, useEffect } from "react";
import { TableColors, TableSettings, TableType } from "../types";
import { PokerTable } from "../svg/PokerTable";
import { RouletteTable } from "../svg/RouletteTable";
import { SymetricTable } from "../svg/SymetricTable";

import { cn } from "@/lib/utils/cn";
import { ShowTableSettings } from "./ShowTableSettings";
import { RotateCcw, RotateCw, Minus, Plus } from "lucide-react";

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
  handleUseAsPoker?: (useAsPoker: boolean) => void;
  useAsPoker?: boolean;
  tableNumber?: string;
  flashDuration?: number;
  bgTable?: string;
  withTopPanel?: boolean;
  isPokerEvent?: boolean;
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
  handleUseAsPoker,
  useAsPoker = false,
  tableNumber = "88",
  flashDuration = 0,
  withTopPanel = false,
  bgTable,
  isPokerEvent = false,
}) => {
  // states for size and rotation
  const [sizeValue, setSize] = useState(size);
  const [rotationValue, setRotation] = useState(rotation);
  const [flashDurationValue] = useState(flashDuration);
  const [tableSettings, setTableSettings] =
    useState<TableSettings>(DEFAULT_SETTINGS);
  const btnSize = isTouch ? 20 : 16;

  // Functions to change rotation and size
  const changeRotation = (increment: number) => {
    const newRotation = (rotationValue + increment + 360) % 360;
    setRotation(newRotation);
    handleRotation && handleRotation(newRotation);
  };

  const changeSize = (increment: number) => {
    const newSize = Math.max(50, Math.min(500, sizeValue + increment));
    setSize(newSize);
    handleSize && handleSize(newSize);
  };

  useEffect(() => {
    setTableSettings(settings || DEFAULT_SETTINGS);
  }, [settings, tableType]);

  const TableComponent = getTableComponent(tableType);

  // Verify if we should display the useAsPoker toggle
  const shouldShowUseAsPokerToggle =
    isPokerEvent && tableType !== TableType.poker;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 items-center pb-2 rounded-xl border border-gray-200 shadow-lg",
        className
      )}
      onMouseOver={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <div
        className={cn("flex justify-between pb-1 mx-3 w-full", {
          hidden: !withTopPanel,
        })}
      >
        <div className="flex flex-row gap-4">
          <button
            onClick={() => changeRotation(-rotationStep)}
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <RotateCcw size={btnSize} />
          </button>
          <button
            onClick={() => changeRotation(rotationStep)}
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <RotateCw size={btnSize} />
          </button>
        </div>
        {/* <RangeInput
          className="w-20 h-4"
          id="flashDuration"
          label="Flash duration"
          value={flashDurationValue || 0}
          min="0"
          max="10"
          step="0.5"
          onChange={(v) => setFlashDuration(v)}
          isTouch={isTouch}
        /> */}

        {shouldShowUseAsPokerToggle && (
          <div className="flex -mt-3 h-full">
            <div className="flex justify-center">
              <label className="flex flex-col gap-1 cursor-pointer label">
                <span className="mr-2 text-sm label-text">
                  Use as poker table
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={useAsPoker}
                  onChange={(e) => handleUseAsPoker?.(e.target.checked)}
                />
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-row gap-4">
          <button
            onClick={() => changeSize(-sizeStep)}
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <Minus size={btnSize} />
          </button>
          <button
            onClick={() => changeSize(sizeStep)}
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
              "btn-md": isTouch,
            })}
          >
            <Plus size={btnSize} />
          </button>
        </div>
      </div>
      <ShowTableSettings
        tableSettings={tableSettings}
        setTableSettings={setTableSettings}
        tableType={tableType}
        setTableType={setTableType}
        saveSettings={saveSettings}
        isTouch={isTouch}
        editing={editing}
        onClose={onClose}
        resetTable={resetTable}
      />

      <TableComponent
        size={sizeValue}
        rotation={rotationValue}
        {...colors}
        {...tableSettings}
        flashDuration={flashDurationValue}
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
