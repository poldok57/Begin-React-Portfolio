import { useRef } from "react";
import { Button } from "@/components/atom/Button";
import { useTableDataStore } from "./stores/tables";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
import { Menu } from "./RoomMenu";
import { TableNumbersProcess } from "./TableNumbersProcess";
import { clearCanvas } from "./scripts/table-numbers";
import { withMousePosition } from "../windows/withMousePosition";

const TableNumbersProcessWP = withMousePosition(TableNumbersProcess);

export enum NumberingMode {
  ByArea = "By area",
  ByLine = "By line",
  OneByOne = "One by one",
}

interface TableNumbersProps {
  className?: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
}
const TableNumbers = ({
  className,
  activeMenu,
  setActiveMenu,
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
    <>
      <div className="flex relative flex-col p-1 w-full" ref={ref}>
        <Button onClick={() => startNumbering()} className={className}>
          table numbering
        </Button>
      </div>
      {activeMenu === Menu.tableNumbers && (
        <TableNumbersProcessWP
          className="absolute z-10 translate-y-24"
          onClose={() => setActiveMenu(null)}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Table Numbering"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};

export { TableNumbers };
