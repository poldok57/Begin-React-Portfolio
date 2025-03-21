import { useState, useEffect, useMemo } from "react";
import { GroupTable, TableColors, TableSettings, TableType } from "../../types";
import { getTableComponent } from "../../Tables/ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "@/lib/stores/groups";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";
import { Pencil } from "lucide-react";
import { GroupActiveToggle } from "./GroupActiveToggle";

import { cn } from "@/lib/utils/cn";
import { menuRoomVariants } from "@/styles/menu-variants";
import { GroupCreatForm } from "./GroupCreatForm";
import { DEFAULT_COLORS } from "./SelectTableColors";
import {
  GroupCreatFilter,
  ActiveStatus,
  normalizeTableType,
} from "./GroupCreatFilter";

export const GroupSelection = ({
  groupId,
  onSelect,
  preSelectType,
  selectOnly = false,
}: {
  groupId?: string;
  onSelect?: (groupId: string | null) => void;
  preSelectType?: TableType;
  selectOnly?: boolean;
}) => {
  const { updateGroup, groups } = useGroupStore();
  const [currentId, setCurrentId] = useState<string | null>(groupId ?? null);
  const [title, setTitle] = useState("");
  const [colors, setColors] = useState<TableColors>(DEFAULT_COLORS);
  const [settings, setSettings] = useState<TableSettings | null>(null);
  const [editing, setEditing] = useState(false);

  // New states for the filters
  const [activeFilter, setActiveFilter] = useState<ActiveStatus>("active");
  const [typeFilter, setTypeFilter] = useState<string>(preSelectType ?? "all");

  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const btnSize = isTouchDevice() ? 20 : 16;
  const [tableType, setTableType] = useState<TableType>(TableType.poker);
  const { tablesStoreName } = useRoomStore();
  const namedStore = useZustandTableStore(tablesStoreName);
  const { updateSelectedTables, countSelectedTables } = namedStore(
    (state) => state
  );

  // Obtain the unique table types for the filter (by grouping Roulette and RouletteL)
  const uniqueTableTypes = useMemo(() => {
    const typesSet = new Set<string>();

    groups.forEach((group) => {
      if (group.type) {
        // Normalize the type before adding it to the set
        typesSet.add(normalizeTableType(group.type));
      }
    });

    return Array.from(typesSet);
  }, [groups]);

  // console.log("preSelectType:", preSelectType);

  // Ensure all groups have the isActive property
  useEffect(() => {
    // Check if any groups don't have the isActive property
    const groupsWithoutIsActive = groups.filter(
      (group) => group.isActive === undefined
    );

    // Update the groups to add isActive = true by default
    if (groupsWithoutIsActive.length > 0) {
      groupsWithoutIsActive.forEach((group) => {
        updateGroup(group.id, { isActive: true });
      });
    }
  }, [groups, updateGroup]);

  // Filter the groups based on the criteria
  const filteredGroups = useMemo(() => {
    return groups.filter((groupItem) => {
      // Treat groups without the isActive property as active
      const isGroupActive = groupItem.isActive !== false;

      // Filter by active status
      if (activeFilter === "active" && !isGroupActive) {
        return false;
      }

      if (activeFilter === "inactive" && isGroupActive) {
        return false;
      }

      // Filter by table type (en tenant compte du regroupement Roulette/RouletteL)
      if (typeFilter !== "all") {
        const normalizedGroupType = normalizeTableType(groupItem.type);
        const normalizedFilterType = normalizeTableType(typeFilter);

        if (normalizedGroupType !== normalizedFilterType) {
          return false;
        }
      }

      return true;
    });
  }, [groups, activeFilter, typeFilter]);

  const onSubmit = (newGroupId: string) => {
    setCurrentId(newGroupId);

    // Get the updated group data directly from the store
    const updatedGroup = getGroup(newGroupId);
    if (updatedGroup) {
      setColors(updatedGroup.colors);
      setSettings(updatedGroup.settings ?? null);
      setTitle(updatedGroup.title ?? "");
      setTableType(updatedGroup.type);
    }

    setEditing(false);
  };

  const selectGroup = (selectId: string) => {
    if (selectId === "new") {
      setCurrentId("new");
      resetTable();
      setEditing(true);
      return;
    }
    const selectedGroup = getGroup(selectId);
    if (selectedGroup) {
      setCurrentId(selectId);

      setTitle(selectedGroup?.title ?? "");
      setColors(selectedGroup?.colors ?? DEFAULT_COLORS);
      setSettings(selectedGroup?.settings ?? null);
      setTableType(selectedGroup?.type ?? TableType.poker);

      // En mode selectOnly, on appelle directement onSelect
      if (selectOnly) {
        onSelect?.(selectId);
      }
    } else if (selectId !== "new" && selectId !== "-") {
      console.warn("Group not found", selectId);
    }
  };

  const resetTable = () => {
    setTitle("");
    setColors(DEFAULT_COLORS);
    setSettings(null);
    setCurrentId(null);
  };

  // Function to toggle the active status of a group
  const toggleGroupActive = (groupId: string, newIsActive?: boolean) => {
    const group = getGroup(groupId);
    if (group) {
      // Si newIsActive est fourni, utiliser cette valeur, sinon inverser l'état actuel
      const updatedIsActive =
        newIsActive !== undefined ? newIsActive : !(group.isActive !== false);

      updateGroup(groupId, {
        isActive: updatedIsActive,
      });
    }
  };

  const themeColors: string[] = ["#000000", "#ffffff"];
  if (colors.borderColor) {
    themeColors.push(colors.borderColor);
  }
  if (colors.fillColor) {
    themeColors.push(colors.fillColor);
  }

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId);
      setEditing(true);
    }
  }, [groupId]);

  const TableComponent = getTableComponent(tableType);

  // Obtain the current group
  const currentGroup = currentId ? getGroup(currentId) : undefined;

  // Add a useEffect to handle the automatic selection
  useEffect(() => {
    if (preSelectType && !currentId) {
      // Filter active groups for preselect type
      const activeGroupsOfType = groups.filter(
        (group) =>
          group.isActive !== false &&
          normalizeTableType(group.type) === normalizeTableType(preSelectType)
      );

      // If only one active group matches the type, select it automatically
      if (activeGroupsOfType.length === 1) {
        const groupToSelect = activeGroupsOfType[0];
        selectGroup(groupToSelect.id);
      }
    }
  }, [preSelectType, groups, currentId]);

  // Update colors and settings when exiting edit mode
  useEffect(() => {
    if (!editing && currentId) {
      const group = getGroup(currentId);
      if (group) {
        setColors(group.colors ?? DEFAULT_COLORS);
        setSettings(group.settings ?? null);
        setTableType(group.type ?? TableType.poker);
        setTitle(group.title ?? "");
      }
    }
  }, [editing, currentId]);

  return (
    <div
      id="menu-creat"
      className={menuRoomVariants({
        width: editing ? 96 : 80,
        maxHeight: "none",
      })}
    >
      {selectOnly ? (
        <h2 className="w-full text-lg font-bold text-center">Open table</h2>
      ) : (
        <>
          <h2 className="w-full text-lg font-bold text-center">
            Group or Tournament
          </h2>

          {/* Filtres */}
          {!editing && (
            <GroupCreatFilter
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              uniqueTableTypes={uniqueTableTypes}
              btnSize={btnSize}
            />
          )}
        </>
      )}
      {!editing && (
        <p>
          <select
            className={cn("w-full select select-primary", {
              "h-32": selectOnly && preSelectType && filteredGroups.length > 3,
              "h-fit":
                selectOnly && preSelectType && filteredGroups.length <= 3,
            })}
            onChange={(e) => {
              selectGroup(e.target.value);
            }}
            value={currentId ?? "-"}
            size={
              selectOnly && preSelectType
                ? Math.min(3, filteredGroups.length)
                : 1
            }
          >
            {(filteredGroups.length === 0 || !selectOnly) && (
              <option value="-" disabled>
                Choose a group
              </option>
            )}
            {!selectOnly && <option value="new">New group</option>}
            {filteredGroups.map((group: GroupTable) => (
              <option
                value={group.id}
                key={group.id}
                onClick={() => {
                  selectGroup(group.id);
                }}
                style={{
                  fontSize: "1.2rem",
                  backgroundColor: group.colors.fillColor,
                  color: group.colors.textColor,
                  cursor: "pointer",
                }}
              >
                {group.title} {group.isActive === false && "(inactif)"}
              </option>
            ))}
          </select>
        </p>
      )}

      {!editing ? (
        <div className="flex relative flex-col justify-center items-center p-2 mx-auto mt-1 w-full rounded-lg border border-opacity-50 h-fit border-secondary">
          <TableComponent
            size={120}
            rotation={0}
            {...colors}
            {...settings}
            tableNumber="88"
            tableText={title}
            type={tableType}
          />

          <div className="flex flex-col gap-2 items-center mt-2 w-full">
            {/* Toggle d'activation en mode visualisation - Masquer en mode selectOnly */}
            {currentId && !selectOnly && (
              <div className="flex justify-center w-full">
                <GroupActiveToggle
                  group={currentGroup}
                  onToggle={(isActive) =>
                    currentId && toggleGroupActive(currentId, isActive)
                  }
                  size="sm"
                />
              </div>
            )}

            <button
              className="mt-2 btn btn-sm"
              onClick={() => {
                updateSelectedTables({ groupId: currentId });
                onSelect?.(currentId);
              }}
            >
              Selected tables: {countSelectedTables()}
            </button>
          </div>

          {/*  Edit button - Hide in selectOnly mode */}
          {!selectOnly && (
            <button
              className="absolute top-2 right-2 btn btn-circle btn-sm"
              onClick={() => setEditing(true)}
            >
              <Pencil size={btnSize} />
            </button>
          )}
        </div>
      ) : (
        <GroupCreatForm
          groupId={currentId ?? null}
          setEditing={setEditing}
          onSubmit={onSubmit}
          btnSize={btnSize}
        />
      )}
    </div>
  );
};
