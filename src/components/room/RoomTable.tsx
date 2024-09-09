import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import { PokerTable } from "./PokerTable";
import { TableData, TableSettings, TableColors } from "./types";
import { useGroupStore } from "./stores/groups";
import { Trash2 } from "lucide-react";
import clsx from "clsx";

import { GROUND_ID } from "./RoomCreat";

interface RoomTableProps {
  table: TableData;
  btnSize: number;
  onDelete: (id: string) => void;
  changeSelected: (id: string, selected: boolean) => void;
}

export const RoomTable = ({
  table,
  btnSize,
  onDelete,
  changeSelected,
}: RoomTableProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const group = useGroupStore((state) => state.groups).find(
    (g) => g.id === table.groupId
  );
  const ground = document.getElementById(GROUND_ID);
  const memoGroundStyle: MutableRefObject<React.CSSProperties | null> =
    useRef(null);

  const settings: TableSettings = {
    ...table.settings,
    ...(group ? group.settings : {}),
  };
  const colors: TableColors = {
    ...(group ? group.colors : {}),
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        ref.current &&
        ground &&
        ground.contains(event.target as Node) &&
        !ref.current.contains(event.target as Node) &&
        !event.shiftKey &&
        !event.ctrlKey
      ) {
        changeSelected(table.id, false);
      }
    },
    [table.id, changeSelected]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside, table.id, changeSelected]);

  const [isGreenBorder, setIsGreenBorder] = useState(false);

  useEffect(() => {
    if (!ground) {
      return;
    }

    if (isGreenBorder) {
      if (!memoGroundStyle.current) {
        memoGroundStyle.current = {
          border: ground.style.border,
          backgroundColor: ground.style.backgroundColor,
          borderRadius: ground.style.borderRadius,
          boxShadow: ground.style.boxShadow,
          transition: ground.style.transition,
        };
      }
      ground.style.border = "2px solid green";
      ground.style.backgroundColor = "rgba(190, 255, 190, 0.3)";
      ground.style.borderRadius = "10px";
      ground.style.boxShadow = "0 0 5px 0 rgba(0, 0, 0, 0.5)";
      ground.style.transition = "all 0.2s ease-in-out";

      const timer = setTimeout(() => {
        setIsGreenBorder(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (memoGroundStyle.current) {
      Object.assign(ground.style, memoGroundStyle.current);
    }
  }, [isGreenBorder]);

  return (
    <div
      ref={ref}
      className={clsx("p-0 m-0 border-2", {
        "border-dotted border-red-500": table.selected,
        "border-transparent": !table.selected,
      })}
      onClick={(event) => {
        changeSelected(table.id, true);
        setIsGreenBorder(true);
        event.stopPropagation();
      }}
    >
      <PokerTable
        size={table.size ?? 100}
        rotation={table.rotation ?? 0}
        tableNumber={table.tableNumber ?? ""}
        tableText={table.tableText ?? ""}
        {...settings}
        {...colors}
      />
      {table.selected && (
        <>
          <div className="absolute -right-5 -bottom-5">
            <button
              className="btn btn-circle btn-sm"
              onClick={() => {
                onDelete(table.id);
              }}
            >
              <Trash2 size={btnSize} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
