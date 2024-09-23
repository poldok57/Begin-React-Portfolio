import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { useTableDataStore } from "./stores/tables";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
import { Menu } from "./RoomMenu";
import { drawArrow } from "@/lib/utils/canvasUtils";
import { Rectangle } from "@/lib/canvas/types";
import { CircleX, CircleCheckBig } from "lucide-react";
import clsx from "clsx";

const MARGIN = 10;

const getElementById = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return null;
  const rect: Rectangle = {
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
  return rect;
};

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
  const { tables, updateTable, updateSelectedTable } = useTableDataStore();
  const { setMode, selectedTableIds, clearSelectedTableIds, ctxTemporary } =
    useRoomContext();

  // Déplacer l'état tableCurrentNumber ici
  const [tableCurrentNumber, setTableCurrentNumber] = useState<string>("1");

  const startNumbering = () => {
    console.log("startNumbering");
    setActiveMenu(Menu.tableNumbers);
    updateSelectedTable({ selected: false });
    setMode(Mode.numbering);
    clearSelectedTableIds();
  };

  const getPerimeter = (
    firstTable: Rectangle,
    secondTable: Rectangle,
    thirdTable: Rectangle
  ) => {
    // Définition du rectangle de numérotation
    const left = Math.min(firstTable.left, secondTable.left, thirdTable.left);
    const top = Math.min(firstTable.top, secondTable.top, thirdTable.top);
    const right = Math.max(
      firstTable.left + firstTable.width,
      secondTable.left + secondTable.width,
      thirdTable.left + thirdTable.width
    );
    const bottom = Math.max(
      firstTable.top + firstTable.height,
      secondTable.top + secondTable.height,
      thirdTable.top + thirdTable.height
    );
    const width = right - left;
    const height = bottom - top;

    return { left, top, right, bottom, width, height };
  };

  const numberingTables = () => {
    if (selectedTableIds.length < 3) return;

    // Copie et incrémentation du numéro de table initial
    let currentNumber = tableCurrentNumber ? parseInt(tableCurrentNumber) : 1;

    // Récupération des tables sélectionnées pour définir le périmètre
    const [firstTableId, secondTableId, thirdTableId] = selectedTableIds;
    const firstTable = getElementById(firstTableId);
    const secondTable = getElementById(secondTableId);
    const thirdTable = getElementById(thirdTableId);

    if (!firstTable || !secondTable || !thirdTable) return;

    // Définition du rectangle de numérotation
    const { left, top, right, bottom } = getPerimeter(
      firstTable,
      secondTable,
      thirdTable
    );

    // Détermination de la direction principale de numérotation
    const isHorizontal =
      Math.abs(secondTable.left - firstTable.left) >
      Math.abs(secondTable.top - firstTable.top);

    // Tri de toutes les tables en fonction de la direction principale
    const sortedTables = tables
      .map((table) => ({
        id: table.id,
        rect: getElementById(table.id),
      }))
      .filter(
        (table): table is { id: string; rect: Rectangle } => table.rect !== null
      )
      .sort((a, b) => {
        if (isHorizontal) {
          // Trier d'abord par lignes (y), puis par colonnes (x)
          const rowDiff = a.rect.top - b.rect.top;
          return rowDiff !== 0 ? rowDiff : a.rect.left - b.rect.left;
        } else {
          // Trier d'abord par colonnes (x), puis par lignes (y)
          const colDiff = a.rect.left - b.rect.left;
          return colDiff !== 0 ? colDiff : a.rect.top - b.rect.top;
        }
      });

    // Numérotation des tables
    sortedTables.forEach(({ id, rect }) => {
      const tableCenterX = rect.left + rect.width / 2;
      const tableCenterY = rect.top + rect.height / 2;

      // Vérification si la table est dans le rectangle (avec une marge de MARGIN)
      if (
        tableCenterX >= left - MARGIN &&
        tableCenterX <= right + MARGIN &&
        tableCenterY >= top - MARGIN &&
        tableCenterY <= bottom + MARGIN
      ) {
        updateTable(id, { tableNumber: currentNumber.toString() });
        currentNumber++;
      }
    });

    // Mise à jour du state tableCurrentNumber
    setTableCurrentNumber(currentNumber.toString());

    // Réinitialisation du mode après la numérotation
    clearSelectedTableIds();
    setActiveMenu(null);
  };

  const toggleValidationButtons = (
    show: boolean,
    position?: { left: number; top: number }
  ) => {
    const validationButtons = document.getElementById("validation-buttons");
    if (show) {
      validationButtons?.classList.remove("hidden");
      if (position && validationButtons) {
        validationButtons.style.left = `${position.left}px`;
        validationButtons.style.top = `${position.top}px`;
      }
    } else {
      validationButtons?.classList.add("hidden");
    }
  };
  const handleValidation = () => {
    numberingTables();
    toggleValidationButtons(false);
  };
  const handleCancel = () => {
    clearSelectedTableIds();
    updateSelectedTable({ selected: false });
    toggleValidationButtons(false);
  };

  const nbSelected = selectedTableIds.length;

  console.log("nbSelected", nbSelected);

  useEffect(() => {
    if (selectedTableIds.length >= 2 && ctxTemporary) {
      const [firstTableId, secondTableId, thirdTableId] = selectedTableIds;
      const firstTable = getElementById(firstTableId);
      const secondTable = getElementById(secondTableId);
      const thirdTable = getElementById(thirdTableId);

      if (firstTable && secondTable) {
        const startX = firstTable.left + firstTable.width / 2;
        const startY = firstTable.top + firstTable.height / 2;
        const endX = secondTable.left + secondTable.width / 2;
        const endY = secondTable.top + secondTable.height / 2;

        ctxTemporary.clearRect(
          0,
          0,
          ctxTemporary.canvas.width,
          ctxTemporary.canvas.height
        );
        drawArrow({
          ctx: ctxTemporary,
          from: { x: startX, y: startY },
          to: { x: endX, y: endY },
          color: "rgba(120, 20, 20, 0.6)",
          curvature: 0.15,
          lineWidth: 10,
          padding: 10, // Ajoutez cette ligne pour spécifier un padding personnalisé
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
          padding: 25, // Ajoutez cette ligne pour spécifier un padding personnalisé
        });

        const { left, top, width, height } = getPerimeter(
          firstTable,
          secondTable,
          thirdTable
        );
        // Afficher le périmètre sur le canvas
        ctxTemporary.beginPath();
        ctxTemporary.strokeStyle = "rgba(0, 0, 255, 0.5)";
        ctxTemporary.setLineDash([5, 5]); // Ajoute un style de ligne pointillée
        ctxTemporary.lineWidth = 2;
        ctxTemporary.rect(
          left - MARGIN,
          top - MARGIN,
          width + MARGIN * 2,
          height + MARGIN * 2
        );
        ctxTemporary.stroke();
        // ctxTemporary.moveTo(left, top);
        // ctxTemporary.lineTo(right, top);
        // ctxTemporary.lineTo(right, bottom);
        // ctxTemporary.lineTo(left, bottom);
        // ctxTemporary.closePath();
        // ctxTemporary.stroke();

        toggleValidationButtons(true, {
          left: thirdTable.left + thirdTable.width + 5,
          top: startY,
        });
      }
    }
  }, [selectedTableIds, ctxTemporary]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleValidationButtons(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
              first table number
            </label>
            <input
              type="text"
              id="tableNumber"
              value={tableCurrentNumber ?? ""}
              onChange={(e) => setTableCurrentNumber(e.target.value)}
              className="px-2 py-1 w-full text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {tableCurrentNumber && (
              <p className="mt-2 text-sm text-gray-800 rounded border-red-500 border-1 p2">
                {nbSelected === 0 && (
                  <>
                    Clic on the <b>first table</b> of the line
                  </>
                )}
                {nbSelected === 1 && (
                  <>
                    Now, clic on the <b>last table</b> of the line
                  </>
                )}
                {nbSelected > 1 && (
                  <>
                    Finally, clic on a table of the <b>last line</b>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}
      <div
        id="validation-buttons"
        className="hidden fixed z-50 p-3 bg-white rounded-lg shadow-lg"
        style={{ left: "0px", top: "0px" }}
      >
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={handleValidation}
          >
            <CircleCheckBig size={btnSize} />
          </button>
          <button
            className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
            onClick={handleCancel}
          >
            <CircleX size={btnSize} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { TableNumbers };
