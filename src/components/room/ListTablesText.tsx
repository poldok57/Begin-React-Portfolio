import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useGroupStore } from "@/lib/stores/groups";
import { TableData } from "./types";
import { GroupCreat } from "./menu/GroupCreat";
import { Dialog, DialogOpen, DialogContent } from "@/components/atom/Dialog";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "../atom/Button";
import { cn } from "@/lib/utils/cn";
import { isTouchDevice } from "@/lib/utils/device";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";

const DEFAULT = {
  textColor: "black",
  numberColor: "black",
  fillColor: "transparent",
  borderColor: "sylver",
  name: "unknown",
};

export const GroupTitle = ({
  groupId,
  nbTables,
  fontSize,
}: {
  groupId: string;
  nbTables?: number;
  fontSize: string;
}) => {
  const { getGroup } = useGroupStore();
  const group = getGroup(groupId);
  const name = group?.title || "Closed";
  const color = group?.colors.textColor || DEFAULT.textColor;
  const borderColor = group?.colors.borderColor || DEFAULT.borderColor;
  const backgroundColor = group?.colors.fillColor || DEFAULT.fillColor;

  return (
    <Dialog blur={true}>
      <DialogOpen className="w-full">
        <h3
          className="block p-3 mb-2 w-full font-bold rounded-lg cursor-pointer lg:min-w-36"
          style={{
            fontSize,
            color,
            backgroundColor,
            border: `outset 4px ${borderColor}`,
          }}
        >
          {name}
          {nbTables && ` (${nbTables})`}
        </h3>
      </DialogOpen>
      <DialogContent position="modal">
        <GroupCreat groupId={groupId} />
      </DialogContent>
    </Dialog>
  );
};

interface ListTablesTournamentProps {
  tournamentId: string;
  tables: TableData[];
  nbTables: number;
  btnSize: number;
}

const ListTablesTournament: React.FC<ListTablesTournamentProps> = ({
  tournamentId,
  tables,
  nbTables,
  btnSize,
}: ListTablesTournamentProps) => {
  const { getGroup } = useGroupStore();

  const { scale, maxRowsPerColumn, tablesStoreName } = useRoomStore();

  const namedStore = useZustandTableStore(tablesStoreName);

  const { updateTable, resetSelectedTables, deleteSelectedTable } = namedStore(
    (state) => state
  );

  const [fontSize, setFontSize] = useState("0.5rem");
  const [titleFontSize, setTitleFontSize] = useState("1rem");

  const group = getGroup(tournamentId);

  const numberColor = group?.colors.numberColor || DEFAULT.numberColor;
  const bgColor = group?.colors.fillColor || DEFAULT.fillColor;
  const borderColor = group?.colors.borderColor || DEFAULT.borderColor;
  const columnCount = Math.ceil(tables.length / maxRowsPerColumn);
  const [withCheckBox, setWithCheckBox] = useState(false);

  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());

  const nbCheckedTables = useMemo(() => checkedTables.size, [checkedTables]);

  const updateWithCheckBox = useCallback((newStatus: boolean) => {
    if (!newStatus) {
      setCheckedTables(new Set());
    }
    setWithCheckBox(newStatus);
  }, []);

  const handleChangeCheckedTables = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, table: TableData) => {
      setCheckedTables((prev) => {
        const newSet = new Set(prev);
        if (e.target.checked) {
          newSet.add(table.id);
        } else {
          newSet.delete(table.id);
        }
        return newSet;
      });

      if (group === undefined) {
        updateTable(table.id, { selected: e.target.checked });
      }
    },
    [group]
  );

  const handleCloseTables = useCallback(() => {
    checkedTables.forEach((tableId) => {
      updateTable(tableId, { groupId: "" });
    });
    setCheckedTables(new Set());
    updateWithCheckBox(false);
    resetSelectedTables();
  }, [checkedTables]);

  const checkedToSelected = useCallback(() => {
    resetSelectedTables();

    checkedTables.forEach((tableId) => {
      updateTable(tableId, { selected: true });
    });
  }, [checkedTables]);

  const handleDeleteTables = useCallback(() => {
    checkedToSelected();
    deleteSelectedTable();
    updateWithCheckBox(false);
    resetSelectedTables();
  }, [checkedTables]);

  useEffect(() => {
    setFontSize(`${scale + 0.1}rem`);
    setTitleFontSize(`${scale + 0.3}rem`);
  }, [scale]);

  return (
    <div key={tournamentId} className="m-4">
      <GroupTitle
        groupId={tournamentId}
        nbTables={nbTables}
        fontSize={titleFontSize}
      />
      <div className="mb-2">
        <label
          className="flex items-center"
          style={{
            fontSize: `${scale - 0.1}rem`,
            transition: "font-size 0.3s ease-in-out",
          }}
        >
          <input
            type="checkbox"
            checked={withCheckBox}
            onChange={(e) => updateWithCheckBox(e.target.checked)}
            className="mr-2"
          />
          Select Tables
        </label>
      </div>
      <div
        className="flex p-2 font-semibold rounded-lg"
        style={{
          backgroundColor: bgColor,
          color: numberColor,
          border: `solid 1px ${borderColor}`,
          fontSize: fontSize,
          transition: "font-size 0.3s ease-in-out",
        }}
      >
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <ul key={columnIndex} className="mx-1 w-full">
            {tables
              .slice(
                columnIndex * maxRowsPerColumn,
                (columnIndex + 1) * maxRowsPerColumn
              )
              .map((table) => (
                <li
                  key={table.id}
                  className="flex items-center p-1 w-full border-b border-opacity-50 min-w-16 lg:min-w-24"
                  style={{ borderColor: borderColor }}
                >
                  {withCheckBox && (
                    <input
                      type="checkbox"
                      id={table.id}
                      className="mr-2"
                      onChange={(e) => {
                        handleChangeCheckedTables(e, table);
                      }}
                    />
                  )}
                  <label
                    htmlFor={table.id}
                    className={cn("cursor-pointer w-full", {
                      "italic font-light": table.tableNumber === "",
                    })}
                    onClick={() => setWithCheckBox(true)}
                  >
                    {table.tableNumber !== ""
                      ? table.tableNumber
                      : DEFAULT.name}
                  </label>
                </li>
              ))}
          </ul>
        ))}
      </div>
      {group !== undefined && nbCheckedTables > 0 && withCheckBox && (
        <Button
          onClick={handleCloseTables}
          className="inline-flex mt-2 btn-warning text-nowrap text-warning-content"
        >
          <PowerOff size={btnSize} />
          Close {nbCheckedTables} Tables
        </Button>
      )}
      {nbCheckedTables > 0 && withCheckBox && group === undefined && (
        <div className="flex flex-col gap-2">
          <Dialog blur={true}>
            <DialogOpen>
              <Button
                onClick={checkedToSelected}
                className="inline-flex mt-2 btn-warning text-nowrap text-warning-content"
              >
                <Power size={btnSize} />
                Open {nbCheckedTables} Tables
              </Button>
            </DialogOpen>

            <DialogContent position="modal">
              <GroupCreat onSelect={(_) => updateWithCheckBox(false)} />
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleDeleteTables}
            className="inline-flex mt-2 btn-error text-nowrap text-error-content"
          >
            <Trash2 size={btnSize} />
            Delete {nbCheckedTables} Tables
          </Button>
        </div>
      )}
    </div>
  );
};

export const ListTablesText = () => {
  const { tablesStoreName } = useRoomStore();
  const namedStore = useZustandTableStore(tablesStoreName);
  const { tables } = namedStore((state) => state);
  const btnSize = isTouchDevice() ? 20 : 16;

  // Fonction pour grouper les tables par tournoi
  const groupTablesByTournament = (tables: TableData[]) => {
    return tables.reduce((acc, table) => {
      const tournamentId = table.groupId || "-";
      if (!acc[tournamentId]) {
        acc[tournamentId] = [];
      }
      acc[tournamentId].push(table);
      return acc;
    }, {} as Record<string, TableData[]>);
  };

  // Grouper les tables par tournoi
  const groupedTables = groupTablesByTournament(tables);

  // Trier les tournois par nombre de tables décroissant
  const sortedTournaments = Object.entries(groupedTables).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="flex flex-wrap justify-center">
      {sortedTournaments
        .sort(([tournamentIdA], [tournamentIdB]) => {
          if (tournamentIdA === "-") return 1;
          if (tournamentIdB === "-") return -1;
          return 0;
        })
        .map(([tournamentId, tournamentTables]) => {
          // Trier les tables par numéro croissant
          const sortedTables = tournamentTables.sort((a, b) => {
            const numA = a.tableNumber ? parseInt(a.tableNumber, 10) : 0;
            const numB = b.tableNumber ? parseInt(b.tableNumber, 10) : 0;
            return numA - numB;
          });
          return (
            <ListTablesTournament
              key={tournamentId}
              tournamentId={tournamentId}
              tables={sortedTables}
              nbTables={tournamentTables.length}
              btnSize={btnSize}
            />
          );
        })}
    </div>
  );
};
