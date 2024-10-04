import { useRef } from "react";
import { Button } from "@/components/atom/Button";
import { useTableDataStore } from "./stores/tables";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
import { Menu } from "./RoomMenu";
import { TableNumbersProcess } from "./TableNumbersProcess";
import { clearCanvas } from "./scripts/table-numbers";
import clsx from "clsx";

export enum NumberingMode {
  ByArea = "By area",
  ByLine = "By line",
  OneByOne = "One by one",
}

interface TableNumbersProps {
  className?: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  btnSize: number;
}
const TableNumbers = ({
  className,
  activeMenu,
  setActiveMenu,
  btnSize,
}: TableNumbersProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { updateSelectedTable } = useTableDataStore();
  const { setMode, clearSelectedTableIds, ctxTemporary } = useRoomContext();

  const startNumbering = () => {
    clearSelectedTableIds();
    updateSelectedTable({ selected: false });
    if (ctxTemporary) {
      clearCanvas(ctxTemporary);
    }

    setActiveMenu(Menu.tableNumbers);
    setMode(Mode.numbering);
  };

  return (
    <div
      className={clsx("flex relative flex-col p-1 w-full", {
        "z-30": activeMenu === Menu.tableNumbers,
      })}
      ref={ref}
    >
      <Button onClick={() => startNumbering()} className={className}>
        table numbering
      </Button>
      {activeMenu === Menu.tableNumbers && (
        <TableNumbersProcess btnSize={btnSize} setActiveMenu={setActiveMenu} />
      )}
    </div>
  );
};

export { TableNumbers };
