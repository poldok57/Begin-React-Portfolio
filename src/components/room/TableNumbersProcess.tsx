import { useState, useRef, useEffect } from "react";
import { useTableDataStore } from "./stores/tables";
import { useRoomContext } from "./RoomProvider";
import { drawArrow } from "@/lib/utils/canvasUtils";
import { addEscapeKeyListener } from "@/lib/utils/keyboard";
import { Rectangle } from "@/lib/canvas/types";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import {
  showValidationFrame,
  addValidationCancelAction,
  addValidationValidAction,
  hideValidationFrame,
} from "./ValidationFrame";
import { TableNumbersHelper } from "./TableNumbersHelper";
import {
  MARGIN,
  getElementById,
  getAngle,
  getPerimeter,
  selectTablesInRect,
  virtualTurningTables,
  calculateFourthAngle,
  clearCanvas,
} from "./scripts/table-numbers";
import { menuRoomVariants } from "@/styles/menu-variants";

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

interface TableNumbersProcessProps {}
export const TableNumbersProcess = ({}: TableNumbersProcessProps) => {
  const {
    tables,
    getTable,
    updateTable,
    updateSelectedTables,
    resetSelectedTables,
    countSelectedTables,
  } = useTableDataStore();
  const { selectedTableIds, clearSelectedTableIds, ctxTemporary } =
    useRoomContext();

  // Déplacer l'état tableCurrentNumber ici
  const [tableCurrentNumber, setStateTableCurrentNumber] =
    useState<string>("1");
  const [numberingMode, setNumberingMode] = useState<NumberingMode>(
    NumberingMode.ByArea
  );
  const numModeRef = useRef<NumberingMode>(NumberingMode.ByArea);

  const updateNumberingMode = (mode: NumberingMode) => {
    setNumberingMode(mode);
    numModeRef.current = mode;
    // clear the selected tables
    clearSelectedTableIds();
    resetSelectedTables();
  };

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
    resetSelectedTables();
    if (ctxTemporary && clearTemporaryCanvas) {
      clearCanvas(ctxTemporary);
    }
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
    if (show) {
      showValidationFrame(position, "Validate table numbering");
      addValidationValidAction(handleValidation);
      addValidationCancelAction(handleCancel);
    } else {
      hideValidationFrame();
    }
  };

  const resetTablesNumber = () => {
    const nbTables = countSelectedTables();
    if (nbTables > 0) {
      updateSelectedTables({ tableNumber: "" });
      return;
    }
    // if no table is selected, reset all tables number
    tables.forEach((table) => {
      updateTable(table.id, { tableNumber: "" });
    });
  };

  const nbSelected = selectedTableIds.length;
  // console.log("nbSelected :", nbSelected);

  useEffect(() => {
    if (selectedTableIds.length === 0) {
      clearCanvas(ctxTemporary);
      toggleValidationButtons(false);
      return;
    }

    const timeoutId = setTimeout(() => {
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
        // console.log("By line", selectedTableIds);
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

        if (firstTable && secondTable) {
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

          if (secondTableId !== thirdTableId) {
            drawArrow({
              ctx: ctxTemporary,
              from: { x: startX, y: startY },
              to: { x: endX, y: endY },
              color: "rgba(20, 80, 20, 0.6)",
              curvature: 0.2,
              lineWidth: 20,
              padding: 25,
            });
          }

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
    }, 0);

    // Nettoyage du timeout
    return () => clearTimeout(timeoutId);
  }, [selectedTableIds, numberingMode]);

  // add escape key listener
  useEffect(() => {
    const removeListener = addEscapeKeyListener(() => {
      toggleValidationButtons(false);
    });

    return () => {
      removeListener();
    };
  }, []);
  // const selectedTables = tables.filter((table) => table.selected);
  const nbSelectedTables = countSelectedTables();

  return (
    <div className={menuRoomVariants({ width: 44 })}>
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
          onChange={(e) => updateNumberingMode(e.target.value as NumberingMode)}
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
      <DeleteWithConfirm
        onConfirm={resetTablesNumber}
        confirmMessage={`Confirm reset ${
          nbSelectedTables > 0 ? nbSelectedTables : "all"
        } tables number`}
        className="btn btn-warning"
      >
        <button className="btn btn-outline btn-warning">
          Reset tables number
        </button>
      </DeleteWithConfirm>
    </div>
  );
};
