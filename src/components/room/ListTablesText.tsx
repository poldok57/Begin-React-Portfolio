import React, { useState } from "react";
import { useTableDataStore } from "./stores/tables";
import { useGroupStore } from "./stores/groups";
import { TableData } from "./types";
import { GroupCreat } from "./GroupCreat";
import { Dialog, DialogOpen, DialogContent } from "../atom/Dialog";

interface TableListProps {
  maxRowsPerColumn: number;
}

export const GroupTitle = ({
  groupId,
  nbTables,
}: {
  groupId: string;
  nbTables?: number;
}) => {
  const { getGroup } = useGroupStore();
  const group = getGroup(groupId);
  const name = group?.title || "Closed";
  const color = group?.colors.textColor || "black";
  const borderColor = group?.colors.borderColor || "sylver";
  const backgroundColor = group?.colors.fillColor;

  const [editGroup, setEditGroup] = useState<string | null>(null);

  return (
    <Dialog blur={true}>
      <DialogOpen>
        <h3
          className="p-2 mb-2 text-xl font-bold rounded-lg"
          style={{
            color: color,
            backgroundColor: backgroundColor,
            border: `solid 2px ${borderColor}`,
          }}
          onClick={() => setEditGroup(groupId)}
        >
          {name}
          {nbTables && ` (${nbTables})`}
        </h3>
      </DialogOpen>
      {editGroup === groupId && (
        <DialogContent position="modal">
          <GroupCreat groupId={groupId} />
        </DialogContent>
      )}
    </Dialog>
  );
};

interface ListTablesTournamentProps {
  tournamentId: string;
  tables: TableData[];
  maxRowsPerColumn: number;
  nbTables: number;
}

const ListTablesTournament: React.FC<ListTablesTournamentProps> = ({
  tournamentId,
  tables,
  maxRowsPerColumn,
  nbTables,
}: ListTablesTournamentProps) => {
  const { getGroup } = useGroupStore();
  const group = getGroup(tournamentId);
  const numberColor = group?.colors.numberColor || "black";
  const bgColor = group?.colors.fillColor || "white";
  const borderColor = group?.colors.borderColor || "sylver";
  const columnCount = Math.ceil(tables.length / maxRowsPerColumn);
  return (
    <div key={tournamentId} className="m-4">
      <GroupTitle groupId={tournamentId} nbTables={nbTables} />
      <div
        className="flex p-2 text-lg font-semibold rounded-lg"
        style={{
          backgroundColor: bgColor,
          color: numberColor,
          border: `solid 1px ${borderColor}`,
        }}
      >
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <ul key={columnIndex} className="mr-8">
            {tables
              .slice(
                columnIndex * maxRowsPerColumn,
                (columnIndex + 1) * maxRowsPerColumn
              )
              .map((table) => (
                <li key={table.id}>{table.tableNumber}</li>
              ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

export const ListTablesText: React.FC<TableListProps> = ({
  maxRowsPerColumn = 25,
}) => {
  const tables = useTableDataStore((state) => state.tables);

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
              maxRowsPerColumn={maxRowsPerColumn}
              nbTables={tournamentTables.length}
            />
          );
        })}
    </div>
  );
};
