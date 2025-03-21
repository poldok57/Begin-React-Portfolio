import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { SelectionItems } from "./SelectionItems";
import { TableData, TableType } from "../../types";
import { RectangleHorizontal } from "lucide-react";
import {
  Rectangle,
  RectPosition as Position,
  Coordinate,
} from "@/lib/canvas/types";
import { useRoomStore } from "@/lib/stores/room";
import { Menu, Mode } from "../../types";
import { SelectTableType } from "./SelectTableType";
import {
  positionTable,
  calculateSelectedRect,
  DEFAULT_TABLE_SIZE,
} from "../../scripts/room-add-tables";
import { withMousePosition } from "../../../windows/withMousePosition";
import { menuRoomContainer, menuRoomVariants } from "@/styles/menu-variants";
import { TableDataState, zustandTableStore } from "@/lib/stores/tables";
import { usePlaceStore } from "@/lib/stores/places";

interface AddTablesMenuProps {
  handleClose: () => void;
}

const AddTablesMenu: React.FC<AddTablesMenuProps> = ({ handleClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  }>({ width: 2, height: 2 });
  const [selectedTableType, setSelectedTableType] = useState<TableType>(
    TableType.poker
  );
  const [useAsPoker, setUseAsPoker] = useState(false);

  const { getSelectedRect, scale, tablesStoreName, setPreSelection } =
    useRoomStore();

  const { getCurrentPlace } = usePlaceStore();
  const currentPlace = getCurrentPlace();

  const storeNameRef = useRef(tablesStoreName);
  const namedStoreRef = useRef<TableDataState | null>(
    zustandTableStore(storeNameRef.current).getState()
  );

  useEffect(() => {
    namedStoreRef.current = zustandTableStore(storeNameRef.current).getState();
  }, [tablesStoreName]);

  const resetSelectedTables = () => {
    namedStoreRef.current?.updateSelectedTables({ selected: false });
  };

  const handleAddTable = (
    x: number,
    y: number,
    tableNumber: number,
    selectedRect: Rectangle
  ) => {
    const offsetStart = {
      left: selectedRect.left + DEFAULT_TABLE_SIZE / 2,
      top: selectedRect.top + DEFAULT_TABLE_SIZE / 4,
    };

    const center: Coordinate = positionTable(offsetStart, x, y);
    const offset: Position = {
      left: Math.round((center.x - selectedRect.left) * scale),
      top: Math.round((center.y - selectedRect.top) * scale),
    };

    const newTable = {
      id: "",
      type: selectedTableType,
      selected: true,
      size: DEFAULT_TABLE_SIZE,
      center,
      offset,
      rotation: 0,
      tableNumber: `tmp${tableNumber}`,
      tableText: `Table ${tableNumber}`,
      useAsPoker: useAsPoker ?? undefined,
    } as TableData;
    namedStoreRef.current?.addTable(newTable);
  };

  const handleAddTables = () => {
    if (!selectedItems) {
      return;
    }

    const selectedRect = calculateSelectedRect({
      parentElement: ref.current,
      containerRect: getSelectedRect(),
      selectedItems,
      scale,
    });
    resetSelectedTables();

    if (!namedStoreRef.current || !namedStoreRef.current.tables) {
      return;
    }
    let tableNumber = namedStoreRef.current?.tables.length + 1;
    for (let y = 0; y < selectedItems.height; y++) {
      for (let x = 0; x < selectedItems.width; x++) {
        handleAddTable(x, y, tableNumber, selectedRect);
        tableNumber++;
      }
    }
    setPreSelection(selectedRect);
    handleClose();
  };

  // Check if we should show the useAsPoker toggle
  const shouldShowUseAsPokerToggle =
    currentPlace?.isPokerEvent && selectedTableType !== TableType.poker;

  return (
    <div
      ref={ref}
      className={menuRoomVariants({
        width: 56,
        maxHeight: "none",
      })}
    >
      <div className="flex justify-center items-center mb-4">
        <label
          htmlFor="add-tables-type"
          className="flex flex-col gap-1 mb-2 text-sm font-medium text-gray-700"
        >
          Table Type
          <SelectTableType
            id="add-tables-type"
            tableType={selectedTableType}
            setTableType={setSelectedTableType}
          />
        </label>
      </div>

      {shouldShowUseAsPokerToggle && (
        <div className="mb-4 form-control">
          <label className="gap-2 justify-start cursor-pointer label">
            <span className="label-text">Use as poker table?</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={useAsPoker}
              onChange={(e) => setUseAsPoker(e.target.checked)}
            />
          </label>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button onClick={handleClose} className="bg-warning">
          Cancel
        </Button>
        <Button onClick={handleAddTables} className="bg-primary">
          Add Tables
        </Button>
      </div>
      <SelectionItems
        handleClose={handleClose}
        setSelectedItems={setSelectedItems}
        selectedItems={selectedItems}
        addTables={handleAddTables}
        Component={
          RectangleHorizontal as React.FC<{
            size: number;
            className: string;
          }>
        }
      />
    </div>
  );
};
const AddTablesMenuWP = withMousePosition(AddTablesMenu);

interface AddTablesProps {
  className: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const AddTables: React.FC<AddTablesProps> = ({
  className,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode } = useRoomStore();

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          className={className}
          onClick={() => {
            setActiveMenu(Menu.addTable);
            setMode(Mode.create);
          }}
          selected={activeMenu === Menu.addTable}
          disabled={disabled}
          title="Add tables"
        >
          Add
        </Button>
      </div>

      {activeMenu === Menu.addTable && (
        <AddTablesMenuWP
          onClose={() => setActiveMenu(null)}
          handleClose={() => setActiveMenu(null)}
          className={menuRoomContainer()}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Add New Tables"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
