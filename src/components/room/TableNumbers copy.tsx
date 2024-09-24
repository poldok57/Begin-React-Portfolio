import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { useTableDataStore } from "./stores/tables";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
import { Menu } from "./RoomMenu";
import { drawArrow } from "@/lib/utils/canvasUtils";
import { addEscapeKeyListener } from "@/lib/utils/keyboard";
import { Rectangle } from "@/lib/canvas/types";
import { showValidationFrame, VALIDATION_ID } from "./ValidationFrame";
import { TableNumbersHelper } from "./TableNumbersHelper";
import {
  MARGIN,
  getElementById,
  getAngle,
  getPerimeter,
  selectTablesInRect,
  virtualTurningTables,
  calculateFourthAngle,
} from "./table-numbers";
import clsx from "clsx";

const ALIGNMENT_TOLERANCE = 25;

type TableNumber = {
  prefix: string;
  number: number | null;
  suffix: string;
};

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
}: TableNumbersProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { tables, getTable, updateTable, updateSelectedTable } =
    useTableDataStore();
  const { setMode, selectedTableIds, clearSelectedTableIds, ctxTemporary } =
    useRoomContext();

  // Déplacer l'état tableCurrentNumber ici
  const [tableCurrentNumber, setStateTableCurrentNumber] =
    useState<string>("1");
  const [numberingMode, setNumberingMode] = useState<NumberingMode>(
    NumberingMode.ByArea
  );
  const withAngle = useRef<boolean>(false);

  const tableNumber = useRef<TableNumber>({
    prefix: "",
    number: 1,
    suffix: "",
  });

  const setTableCurrentNumber = (number: string) => {
    // Update the tableNumber object with prefix, number, and suffix
    const prefixMatch = number.match(/^[^\d]*/);
    const suffixMatch = number.match(/[^\d]*$/);
    const numberMatch = number.match(/\d+/);

    tableNumber.current.prefix = prefixMatch ? prefixMatch[0] : "";
    tableNumber.current.suffix =
      suffixMatch && numberMatch !== null ? suffixMatch[0] : "";
    tableNumber.current.number = numberMatch ? parseInt(numberMatch[0]) : null;

    setStateTableCurrentNumber(number);
  };

  // update the table number or the state tableCurrentNumber then id is null
  const updateTableNumber = (id: string | null, num: number | null) => {
    const number: string = num === null ? "" : num.toString();
    const newTableNumber =
      tableNumber.current.prefix + number + tableNumber.current.suffix;

    if (id === null) {
      tableNumber.current.number = num;
      setStateTableCurrentNumber(newTableNumber);
      return;
    }
    updateTable(id, { tableNumber: newTableNumber });
  };

  const clearSelection = (clearTemporaryCanvas: boolean = true) => {
    clearSelectedTableIds();
    updateSelectedTable({ selected: false });
    if (ctxTemporary && clearTemporaryCanvas) {
      ctxTemporary.clearRect(
        0,
        0,
        ctxTemporary.canvas.width,
        ctxTemporary.canvas.height
      );
    }
  };

  const startNumbering = () => {
    setActiveMenu(Menu.tableNumbers);
    clearSelection();
    setMode(Mode.numbering);
  };

  const numberingTables = () => {
    if (selectedTableIds.length < 3 || numberingMode === NumberingMode.OneByOne)
      return;

    // Copie et incrémentation du numéro de table initial
    let currentNumber = tableNumber.current.number ?? 1;

    // Récupération des tables sélectionnées pour définir le périmètre
    const [firstTableId, secondTableId, thirdTableId, fourthTableId] =
      selectedTableIds;
    const firstTable = getElementById(firstTableId);
    const secondTable = getElementById(secondTableId);
    const thirdTable = getElementById(thirdTableId);
    let fourthTable = getElementById(fourthTableId);
    if (!firstTable || !secondTable || !thirdTable) return;

    if (
      withAngle.current &&
      numberingMode === NumberingMode.ByArea &&
      fourthTable === null
    ) {
      fourthTable = calculateFourthAngle(firstTable, secondTable, thirdTable);
      if (!fourthTable) {
        console.log("fourthTable : missing");
        return;
      }
    }
    const angle = getAngle(firstTable, secondTable);

    // define the rectangle of numbering
    const rectArea = getPerimeter(
      firstTable,
      secondTable,
      thirdTable,
      fourthTable
    );

    const selectedTables = selectTablesInRect(rectArea, tables);

    if (withAngle.current) {
      virtualTurningTables({
        tables: selectedTables,
        rect: rectArea,
        angle: -(angle % 90),
        // ctx: ctxTemporary,
      });
    }

    // define the direction of numbering
    const isHorizontal =
      Math.abs(secondTable.left - firstTable.left) >
      Math.abs(secondTable.top - firstTable.top);

    const firstCrossDirection: boolean = isHorizontal
      ? firstTable.left < secondTable.left
      : firstTable.top < secondTable.top;
    const secondCrossDirection = isHorizontal
      ? firstTable.top < thirdTable.top
      : firstTable.left < thirdTable.left;

    // sort all tables by main direction and numbering direction
    const sortedTables = selectedTables
      .map((table) => ({
        id: table.id,
        rect: table.domRectangle ?? getElementById(table.id),
      }))
      .filter(
        (table): table is { id: string; rect: Rectangle } => table.rect !== null
      )
      .sort((a, b) => {
        if (isHorizontal) {
          // Sort first by row, then by column
          const rowDiff = Math.abs(a.rect.top - b.rect.top);
          if (rowDiff <= ALIGNMENT_TOLERANCE) {
            if (firstCrossDirection) {
              return a.rect.left - b.rect.left;
            } else {
              return b.rect.left - a.rect.left;
            }
          }
          if (secondCrossDirection) {
            return a.rect.top - b.rect.top;
          } else {
            return b.rect.top - a.rect.top;
          }
        } else {
          // Sort first by column, then by row
          const colDiff = Math.abs(a.rect.left - b.rect.left);
          if (colDiff <= ALIGNMENT_TOLERANCE) {
            if (firstCrossDirection) {
              return a.rect.top - b.rect.top;
            } else {
              return b.rect.top - a.rect.top;
            }
          }
          if (secondCrossDirection) {
            return a.rect.left - b.rect.left;
          } else {
            return b.rect.left - a.rect.left;
          }
        }
      });

    if (
      numberingMode === NumberingMode.ByArea ||
      numberingMode === NumberingMode.ByLine
    ) {
      const rectRight = rectArea.right ?? rectArea.left + rectArea.width;
      const rectBottom = rectArea.bottom ?? rectArea.top + rectArea.height;
      sortedTables.forEach(({ id, rect }) => {
        const tableCenterX = rect.left + rect.width / 2;
        const tableCenterY = rect.top + rect.height / 2;

        // if the table is in the rectangle, update the table number
        if (
          tableCenterX >= rectArea.left - MARGIN &&
          tableCenterX <= rectRight + MARGIN &&
          tableCenterY >= rectArea.top - MARGIN &&
          tableCenterY <= rectBottom + MARGIN
        ) {
          updateTableNumber(id, currentNumber);
          currentNumber++;
        }
      });
    }

    // Update state tableCurrentNumber
    updateTableNumber(null, currentNumber);

    clearSelection(false);
  };

  const handleValidation = () => {
    numberingTables();
    toggleValidationButtons(false);
  };
  const handleCancel = () => {
    clearSelection();
    toggleValidationButtons(false);
  };

  const toggleValidationButtons = (
    show: boolean,
    position?: { left: number; top: number }
  ) => {
    const validBtn = document.getElementById(VALIDATION_ID.BUTTON);
    const validCancel = document.getElementById(VALIDATION_ID.CANCEL);
    if (show) {
      const validationText = document.getElementById(VALIDATION_ID.TEXT);
      if (validationText) {
        validationText.textContent = "Validate table numbering";
      }
      showValidationFrame(position);
      if (validBtn) {
        validBtn.addEventListener("click", handleValidation);
      }
      if (validCancel) {
        validCancel.addEventListener("click", handleCancel);
      }
    } else {
      if (validBtn) {
        validBtn.removeEventListener("click", handleValidation);
      }
      if (validCancel) {
        validCancel.removeEventListener("click", handleCancel);
      }
    }
  };

  const nbSelected = selectedTableIds.length;
  console.log("nbSelected :", nbSelected);

  useEffect(() => {
    if (numberingMode === NumberingMode.OneByOne) {
      // One by one duplicate the last table to use "by area" processing
      if (selectedTableIds.length === 1) {
        const [firstTableId] = selectedTableIds;
        const table = getTable(firstTableId);
        if (table) {
          const currentNumber = tableNumber.current.number;
          updateTableNumber(table.id, currentNumber);
          if (currentNumber !== null) {
            updateTableNumber(null, currentNumber + 1);
          }
        }
        clearSelection();
      }
      return;
    }
    if (numberingMode === NumberingMode.ByLine) {
      // By line duplicate the last table to use "by area" processing
      if (selectedTableIds.length === 2) {
        const [firstTableId, secondTableId] = selectedTableIds;
        const firstTable = getElementById(firstTableId);
        const secondTable = getElementById(secondTableId);

        if (firstTable && secondTable) {
          selectedTableIds.push(secondTableId);
        }
      }
    }

    if (selectedTableIds.length >= 2 && ctxTemporary) {
      const [firstTableId, secondTableId, thirdTableId, fourthTableId] =
        selectedTableIds;
      const firstTable = getElementById(firstTableId);
      const secondTable = getElementById(secondTableId);
      const thirdTable = getElementById(thirdTableId);
      let fourthTable = getElementById(fourthTableId);

      if (numberingMode === NumberingMode.ByArea && firstTable && secondTable) {
        const startX = firstTable.left + firstTable.width / 2;
        const startY = firstTable.top + firstTable.height / 2;
        const endX = secondTable.left + secondTable.width / 2;
        const endY = secondTable.top + secondTable.height / 2;

        drawArrow({
          ctx: ctxTemporary,
          from: { x: startX, y: startY },
          to: { x: endX, y: endY },
          color: "rgba(120, 20, 20, 0.6)",
          curvature: 0.15,
          lineWidth: 10,
          padding: 10,
        });
      }
      if (firstTable && secondTable && thirdTable) {
        const startX = firstTable.left + firstTable.width / 2;
        const startY = firstTable.top + firstTable.height / 2;
        const endX = thirdTable.left + thirdTable.width / 2;
        const endY = thirdTable.top + thirdTable.height / 2;

        drawArrow({
          ctx: ctxTemporary,
          from: { x: startX, y: startY },
          to: { x: endX, y: endY },
          color: "rgba(20, 80, 20, 0.6)",
          curvature: 0.2,
          lineWidth: 20,
          padding: 25,
        });

        const angle = getAngle(firstTable, secondTable);
        withAngle.current =
          Math.abs(angle % 90) > 5 && Math.abs(angle % 90) < 85;

        if (
          withAngle.current &&
          numberingMode === NumberingMode.ByArea &&
          fourthTable === null
        ) {
          fourthTable = calculateFourthAngle(
            firstTable,
            secondTable,
            thirdTable,
            ctxTemporary
          );

          if (!fourthTable) {
            return;
          }
        }

        const { left, top, width } = getPerimeter(
          firstTable,
          secondTable,
          thirdTable,
          fourthTable,
          ctxTemporary
        );

        toggleValidationButtons(true, {
          left: left + width - 80,
          top: top - 40,
        });
      }
    }
  }, [selectedTableIds]);

  // add escape key listener
  useEffect(() => {
    const removeListener = addEscapeKeyListener(() => {
      toggleValidationButtons(false);
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <div className={clsx("relative z-30", className)} ref={ref}>
      <Button onClick={() => startNumbering()}>table numbering</Button>
      {activeMenu === Menu.tableNumbers && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg translate-x-16 min-w-44">
          <div className="mb-2">
            <label
              htmlFor="tableNumber"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              First table number
            </label>
            <input
              type="text"
              id="tableNumber"
              value={tableCurrentNumber ?? ""}
              onChange={(e) => setTableCurrentNumber(e.target.value)}
              className="px-2 py-1 w-full text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="numberingMode"
              className="block mt-2 mb-1 text-sm font-medium text-gray-700"
            >
              Numbering mode
            </label>
            <select
              id="numberingMode"
              value={numberingMode}
              onChange={(e) =>
                setNumberingMode(e.target.value as NumberingMode)
              }
              className="px-2 py-1 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={NumberingMode.ByArea}>By area</option>
              <option value={NumberingMode.ByLine}>By line</option>
              <option value={NumberingMode.OneByOne}>One by one</option>
            </select>

            {tableCurrentNumber && (
              <TableNumbersHelper
                nbSelected={nbSelected}
                withAngle={withAngle.current}
                numberingMode={numberingMode}
                tableNumber={tableNumber.current.number}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { TableNumbers };
