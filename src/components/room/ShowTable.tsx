import React, { useState, useEffect } from "react";
import { TableColors, TableSettings } from "./types";
import { PokerTable } from "./PokerTable";
import { RangeInput } from "@/components/atom/RangeInput";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Settings,
  Save,
  ListRestart,
} from "lucide-react";
import SettingsOff from "@/components/atom/svg/SettingsOff";
import clsx from "clsx";

const DEFAULT_SETTINGS = {
  widthLine: 0.025,
  heightRatio: 0.28,
  concaveRatio: 0.07,
  textRatio: 0.3,
  opacity: 0.4,
};

interface ShowTableProps {
  colors: TableColors | undefined;
  settings?: TableSettings | null;
  title: string | undefined;
  saveSettings: (settings: TableSettings) => void;
  resetTable?: () => void;
  isTouch: boolean;
}
export const ShowTable: React.FC<ShowTableProps> = ({
  colors,
  settings,
  title,
  saveSettings,
  resetTable,
  isTouch,
}) => {
  // states for size and rotation
  const [size, setSize] = useState(200);
  const [rotation, setRotation] = useState(0);
  const [openSettings, setOpenSettings] = useState(false);
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
    setRotation((prevRotation) => (prevRotation + increment + 360) % 360);
  };

  const changeSize = (increment: number) => {
    setSize((prevSize) => Math.max(50, Math.min(500, prevSize + increment)));
  };

  useEffect(() => {
    setTableSettings(settings || DEFAULT_SETTINGS);
  }, [settings]);

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex mt-3 z-[1] mx-3 justify-between border-b-2 border-gray-200 pb-1 w-full">
        <div className="flex flex-row gap-3">
          <button
            onClick={() => changeRotation(-15)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
            })}
          >
            <RotateCcw size={btnSize} />
          </button>
          <button
            onClick={() => changeRotation(15)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
            })}
          >
            <RotateCw size={btnSize} />
          </button>
        </div>
        <div className="flex flex-row gap-3">
          <button
            onClick={() => changeSize(-10)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
            })}
          >
            <Minus size={btnSize} />
          </button>
          <button
            onClick={() => changeSize(10)}
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
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
        <div className="flex flex-row gap-2 justify-between w-full z-[1]">
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
          {resetTable && (
            <button
              className={clsx("btn btn-circle", {
                "btn-sm": !isTouch,
                hidden: openSettings || title,
              })}
              title="Reset table"
              onClick={resetTable}
            >
              <ListRestart size={btnSize} />
            </button>
          )}
          <button
            className={clsx("btn btn-circle", {
              "btn-sm": !isTouch,
              hidden: !openSettings,
            })}
            onClick={() => saveSettings(tableSettings)}
          >
            <Save size={btnSize} />
          </button>
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
            label="Cashier opacity"
            value={tableSettings.opacity || 0}
            min="0"
            max="1"
            step="0.01"
            onChange={(v) => handleSettingsChange("opacity", v)}
            isTouch={isTouch}
          />
        </div>
      </div>
      <PokerTable
        size={size}
        rotation={rotation}
        {...colors}
        {...tableSettings}
        tableNumber="88"
        tableText={title}
      />
    </div>
  );
};
