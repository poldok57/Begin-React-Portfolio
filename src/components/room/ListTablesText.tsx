import React from "react";
import { useTableDataStore } from "./stores/tables";
import { useGroupStore } from "./stores/groups";
import { TableData } from "./types";

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
  const backgroundColor = group?.colors.fillColor;
  return (
    <h3
      className="p-2 mb-2 text-lg font-bold"
      style={{ color: color, backgroundColor: backgroundColor }}
    >
      {name}
      {nbTables && ` (${nbTables})`}
    </h3>
  );
};

export const ListTablesText: React.FC<TableListProps> = ({
  maxRowsPerColumn = 40,
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
    <div className="flex flex-wrap justify-start">
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

          // Calculer le nombre de colonnes nécessaires
          const columnCount = Math.ceil(sortedTables.length / maxRowsPerColumn);

          return (
            <div key={tournamentId} className="m-4">
              <GroupTitle
                groupId={tournamentId}
                nbTables={tournamentTables.length}
              />
              <div className="flex">
                {Array.from({ length: columnCount }).map((_, columnIndex) => (
                  <ul key={columnIndex} className="mr-8">
                    {sortedTables
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
        })}
    </div>
  );
};
