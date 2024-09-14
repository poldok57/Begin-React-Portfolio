import React from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";
import { Rectangle } from "@/lib/canvas/types";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useScale } from "./RoomProvider";

interface RoomMenuProps {
  btnSize: number;
  reccordBackround: (color: string, name: string, opacity: number) => void;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
}

export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  reccordBackround,
  addSelectedRect,
  resetSelectedTables,
}) => {
  const isTouch = isTouchDevice();
  const { scale, setScale } = useScale();

  return (
    <div
      className="flex flex-col gap-2 p-2 mx-2 w-56 rounded-xl border-2 bg-base-200 border-base-300"
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
      <RoomDesign
        className="flex flex-col p-1 w-full rounded-lg"
        reccordBackround={reccordBackround}
        isTouch={isTouch}
      />
      <RangeInput
        id="scale"
        label="Scale"
        value={scale}
        min="0.4"
        max="2"
        step="0.1"
        className="w-full h-4"
        isTouch={isTouch}
        onChange={(value: number) => setScale(value)}
      />
    </div>
  );
};
