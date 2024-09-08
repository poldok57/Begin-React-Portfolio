import React from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";

interface RoomMenuProps {
  btnSize: number;
  reccordBackround: (color: string, name: string, opacity: number) => void;
}

export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  reccordBackround,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 mx-2 w-56 rounded-xl border-2 bg-base-200 border-base-300">
      <RoomAddTables className="flex flex-col p-1 w-full rounded-lg" />
      <UpdateSelectedTables
        className="flex flex-col p-1 w-full rounded-lg"
        btnSize={btnSize}
      />
      <RoomDesign
        className="flex flex-col p-1 w-full rounded-lg"
        reccordBackround={reccordBackround}
      />
    </div>
  );
};
