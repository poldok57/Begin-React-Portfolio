import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { useTableDataStore } from "../stores/tables";
import { useScale } from "../RoomProvider";

interface RotationSquadProps {
  btnSize: number;
}

export const RotationSquad: React.FC<RotationSquadProps> = ({ btnSize }) => {
  const { updateTable, getSelectedTables } = useTableDataStore();
  const { setRotation, getRotation, getSelectedRect, getElementRect } =
    useScale();

  const setRotationSquad = (angle: number) => {
    const rotation = getRotation();
    const newRotation = (rotation + angle) % 360;

    const selectedTables = getSelectedTables();
    const selectedRect = getSelectedRect();
    // get the center of the selected rect
    if (selectedRect) {
      const centerX = selectedRect.left + selectedRect.width / 2;
      const centerY = selectedRect.top + selectedRect.height / 2;
      const cos = Math.cos((angle * Math.PI) / 180);
      const sin = Math.sin((angle * Math.PI) / 180);

      selectedTables.forEach((table) => {
        const rect = getElementRect(table.id);
        if (!rect) return;
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const tableCenterX = table.position.left + halfWidth;
        const tableCenterY = table.position.top + halfHeight;
        const dx = tableCenterX - centerX;
        const dy = tableCenterY - centerY;

        const position = {
          left: Math.round(centerX + (dx * cos - dy * sin) - halfWidth),
          top: Math.round(centerY + (dx * sin + dy * cos) - halfHeight),
        };

        // console.log(table.position, "=>", position);

        updateTable(table.id, {
          position,
          rotation: (table.rotation || 0) + angle,
        });
      });
    }

    setRotation(newRotation);
  };

  return (
    <div className="flex flex-col gap-1 justify-center text-center border-t-2 border-gray-500 border-opacity-50">
      Apply to the squad
      <div className="flex flex-row gap-2 justify-between">
        <button
          className="btn btn-circle btn-md"
          onClick={() => setRotationSquad(-5)}
        >
          <RotateCcw size={btnSize + 10} />
        </button>
        <button
          className="btn btn-circle btn-md"
          onClick={() => setRotationSquad(5)}
        >
          <RotateCw size={btnSize + 10} />
        </button>
      </div>
    </div>
  );
};
