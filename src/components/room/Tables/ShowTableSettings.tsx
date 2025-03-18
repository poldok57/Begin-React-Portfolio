import React, { useState, useEffect } from "react";
import { TableSettings, TableType } from "../types";
import { PokerTable } from "../svg/PokerTable";
import { RouletteTable } from "../svg/RouletteTable";
import { SymetricTable } from "../svg/SymetricTable";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { RangeInput } from "@/components/atom/RangeInput";
import { Settings, Save, ListRestart, PencilOff } from "lucide-react";
import SettingsOff from "@/components/atom/svg/SettingsOff";
import { cn } from "@/lib/utils/cn";
import { SelectTableType } from "../menu/Tables/SelectTableType";

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

interface ShowTableSetingsProps {
  tableSettings: TableSettings | null;
  setTableSettings: (settings: TableSettings) => void;
  tableType?: TableType;
  setTableType: (tableType: TableType) => void;
  saveSettings: (settings: TableSettings) => void;
  resetTable?: () => void;
  onClose?: () => void;
  isTouch: boolean;
  editing?: boolean;
}
export const ShowTableSettings: React.FC<ShowTableSetingsProps> = ({
  tableSettings,
  setTableSettings,
  tableType = TableType.poker,
  setTableType,
  saveSettings,
  resetTable,
  isTouch,
  onClose,
  editing = false,
}) => {
  // states for size and rotation
  const [openSettings, setOpenSettings] = useState(editing);
  // const [tableSettings, setTableSettings] =
  useState<TableSettings>(DEFAULT_SETTINGS);
  const btnSize = isTouch ? 20 : 16;
  const handleSettingsChange = (name: string, value: number) => {
    // console.log("name:", name, "value:", value);
    if (tableSettings) {
      const newSettings = {
        ...tableSettings,
        [name]: value,
      };
      setTableSettings(newSettings);
    }
  };

  // useEffect(() => {
  //   if (settings) {
  //     setTableSettings(settings);
  //   } else {
  //     setTableSettings(DEFAULT_SETTINGS);
  //   }
  // }, [settings, tableType]);

  useEffect(() => {
    setOpenSettings(editing);
  }, [editing]);

  // Utiliser une valeur par défaut si tableSettings est null
  const safeSettings = tableSettings || DEFAULT_SETTINGS;

  return (
    <div
      className={cn(
        [
          "flex flex-col p-2 mx-3 min-w-full w-fit z-[1]",
          "transition-all duration-300 ease-in-out",
        ],
        {
          "rounded-lg border border-gray-400 shadow-lg bg-paper": openSettings,
          "mb-10": openSettings,
          "-mb-5": !openSettings,
        }
      )}
    >
      <div className="flex flex-row gap-2 justify-between mb-3 w-full">
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className={cn("btn btn-circle", {
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
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
            })}
            onClick={onClose}
          >
            <PencilOff size={btnSize} />
          </button>
        )}
        <div
          className={cn("flex relative flex-row gap-4", {
            hidden: !openSettings,
          })}
        >
          {resetTable && (
            <DeleteWithConfirm
              confirmClassName="p-2 m-1 btn btn-sm"
              className={cn("btn btn-circle", {
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
            className={cn("btn btn-circle", {
              "btn-sm": !isTouch,
              hidden: !openSettings,
            })}
            title="Save settings"
            onClick={() => tableSettings && saveSettings(tableSettings)}
          >
            <Save size={btnSize} />
          </button>
        </div>
      </div>
      <div
        className={cn("flex flex-row gap-2 justify-between pt-2 w-full", {
          hidden: !openSettings,
        })}
      >
        <RangeInput
          className="w-20 h-4"
          id="widthLine"
          label="Line"
          value={safeSettings.widthLine || 0}
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
          value={safeSettings.heightRatio || 0}
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
          value={safeSettings.textRatio || 0}
          min="0.1"
          max="0.4"
          step="0.01"
          onChange={(v) => handleSettingsChange("textRatio", v)}
          isTouch={isTouch}
        />
      </div>
      <div
        className={cn("flex flex-row gap-2 justify-between w-full", {
          hidden: !openSettings,
        })}
      >
        <RangeInput
          className="w-20 h-4"
          id="concaveRatio"
          label="Concave (Dealer)"
          value={safeSettings.concaveRatio || 0}
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
          value={safeSettings.opacity || 0}
          min="0"
          max="1"
          step="0.01"
          onChange={(v) => handleSettingsChange("opacity", v)}
          isTouch={isTouch}
        />
      </div>
    </div>
  );
};
