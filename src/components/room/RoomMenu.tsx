import React from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";
import { Rectangle } from "@/lib/canvas/types";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useScale } from "./RoomProvider";
import { DesignType } from "./types";
import { TableNumbers } from "./TableNumbers";

interface RoomMenuProps {
  btnSize: number;
  recordDesign: (
    type: DesignType,
    color: string,
    name: string,
    opacity: number
  ) => void;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
  setTableCurrentNumber: (number: string) => void;
  tableCurrentNumber: string | null;
}

export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  recordDesign,
  addSelectedRect,
  resetSelectedTables,
  setTableCurrentNumber,
  tableCurrentNumber,
}) => {
  const isTouch = isTouchDevice();

  const { scale, setScale } = useScale();

  return (
    <div
      id="room-menu"
      className="flex inset-1 z-10 flex-col gap-2 p-2 mx-2 w-56 rounded-xl border-2 bg-base-200 border-base-300"
      onMouseOver={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <RoomAddTables
        className="flex flex-col p-1 w-full rounded-lg"
        addSelectedRect={addSelectedRect}
        resetSelectedTables={resetSelectedTables}
      />
      <UpdateSelectedTables
        className="flex flex-col p-1 w-full rounded-lg"
        btnSize={btnSize}
        isTouch={isTouch}
      />
      <TableNumbers
        className="flex flex-col p-1 w-full rounded-lg"
        setTableCurrentNumber={setTableCurrentNumber}
        tableCurrentNumber={tableCurrentNumber}
      />
      <RoomDesign
        className="flex flex-col p-1 w-full rounded-lg"
        recordDesign={recordDesign}
        isTouch={isTouch}
      />
      <RangeInput
        id="scale"
        label="Scale"
        value={scale}
        min="0.4"
        max="2"
        step="0.1"
        className="mx-1 w-full h-4"
        isTouch={isTouch}
        onChange={(value: number) => setScale(value)}
      />
    </div>
  );
};
