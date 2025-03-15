import { useRef } from "react";
import { Button } from "@/components/atom/Button";
import { useZustandTableStore } from "../../../lib/stores/tables";
import { useRoomStore } from "@/lib/stores/room";
import { Mode, Menu } from "../types";
import { TableNumbersProcess } from "./TableNumbersProcess";
import { withMousePosition } from "../../windows/withMousePosition";
import { menuRoomContainer } from "@/styles/menu-variants";

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
  disabled?: boolean;
}
const TableNumbers = ({
  className,
  activeMenu,
  setActiveMenu,
  disabled = false,
}: TableNumbersProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    setMode,
    defaultMode,
    clearSelectedTableIds,
    clearTemporaryCanvas,
    tablesStoreName,
  } = useRoomStore();

  const namedStore = useZustandTableStore(tablesStoreName);

  const { resetSelectedTables } = namedStore((state) => state);

  const startNumbering = () => {
    clearSelectedTableIds();
    resetSelectedTables();
    clearTemporaryCanvas("startNumbering");

    setActiveMenu(Menu.tableNumbers);
    setMode(Mode.numbering);
  };

  return (
    <>
      <div className="flex relative flex-col p-1 w-full" ref={ref}>
        <Button
          onClick={() => startNumbering()}
          className={className}
          disabled={disabled}
          title="Table numbering"
        >
          Numbering
        </Button>
      </div>
      {activeMenu === Menu.tableNumbers && (
        <TableNumbersProcessWP
          className={menuRoomContainer()}
          onClose={() => {
            setActiveMenu(null);
            setMode(defaultMode);
          }}
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
