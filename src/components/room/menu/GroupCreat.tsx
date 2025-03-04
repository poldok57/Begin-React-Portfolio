import { useState, useEffect } from "react";
import { GroupTable, TableColors, TableSettings, TableType } from "../types";
import { ShowTable, getTableComponent } from "../ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "@/lib/stores/groups";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";
import { Palette, ArrowBigUpDash, Trash2, Pencil } from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { ModifyColor } from "../ModifyColor";

import { cn } from "@/lib/utils/cn";

const DEFAULT_COLORS = {
  borderColor: "#333333",
  fillColor: "#aaaaaa",
  numberColor: "#000000",
  textColor: "#111199",
};

export const GroupCreat = ({
  groupId,
  onSelect,
}: {
  groupId?: string;
  onSelect?: (groupId: string | null) => void;
}) => {
  const { addGroup, updateGroup, deleteGroup, groups } = useGroupStore();
  const [currentId, setCurrentId] = useState<string | null>(groupId ?? null);
  const [title, setTitle] = useState("");
  const [colors, setColors] = useState<TableColors>(DEFAULT_COLORS);
  const [settings, setSettings] = useState<TableSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [showColors, setShowColors] = useState(true);
  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const isTouch = isTouchDevice();
  const btnSize = isTouch ? 20 : 16;
  const [tableType, setTableType] = useState<TableType>(TableType.poker);
  const { tablesStoreName } = useRoomStore();
  const namedStore = useZustandTableStore(tablesStoreName);
  const { updateSelectedTables, countSelectedTables } = namedStore(
    (state) => state
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = event.target as HTMLFormElement;

    const group: GroupTable = {
      id: input.currentId.value,
      title: input.titleGroup.value,
      type: tableType,
      colors: { ...colors },
      settings: undefined,
    };
    if (currentId === null) {
      if (settings) {
        group.settings = settings;
      }
      const newId = addGroup(group);
      setCurrentId(newId);
    } else {
      updateGroup(currentId, group);
    }
  };
  const saveSettings = (newSettings: TableSettings) => {
    // console.log("settings:", settings);
    setSettings(newSettings);

    if (currentId) {
      updateGroup(currentId, {
        settings: newSettings,
        type: tableType,
      });
    }
  };

  const selectGroup = (selectId: string) => {
    if (selectId === "new") {
      setCurrentId(null);
      resetTable();
      setEditing(true);
      setShowColors(true);
      return;
    }
    const selectedGroup = getGroup(selectId);
    if (selectedGroup) {
      setCurrentId(selectId);
      setTitle(selectedGroup?.title ?? "");
      setColors(selectedGroup?.colors ?? DEFAULT_COLORS);
      setSettings(selectedGroup?.settings ?? null);
      setTableType(selectedGroup?.type ?? TableType.poker);
    } else if (selectId !== "new" && selectId !== "-") {
      console.log("Group not found", selectId);
    }
  };
  const changeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newColors = {
      ...colors,
      [name]: value,
    };
    setColors(newColors);
  };
  const changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTitle(value);
  };

  const resetTable = () => {
    setTitle("");
    setColors(DEFAULT_COLORS);
    setSettings(null);
    setCurrentId(null);
    setShowColors(false);
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
      // console.log("select groupId:", groupId);
      selectGroup(groupId);
      setEditing(true);
      setShowColors(true);
    }
  }, [groupId]);

  const TableComponent = getTableComponent(tableType);

  return (
    <div
      className={cn("shadow-xl bg-base-100", {
        "w-96 card": editing,
        "w-80 rounded-lg": !editing,
      })}
    >
      <div className="card-body">
        <h2 className="card-title">Group or Tournament</h2>
        <p>
          <select
            className="w-full max-w-xs select select-primary"
            onChange={(e) => selectGroup(e.target.value)}
            value={currentId ?? ""}
          >
            <option value="" disabled>
              Choose or creat a group?
            </option>
            <option value="new">New group</option>
            {groups.map((group: GroupTable) => (
              <option
                value={group.id}
                key={group.id}
                style={{
                  fontSize: "1.2rem",
                  backgroundColor: group.colors.fillColor,
                  color: group.colors.textColor,
                }}
              >
                {group.title}
              </option>
            ))}
          </select>
        </p>
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

            <button
              className="mt-4 btn btn-sm"
              onClick={() => {
                updateSelectedTables({ groupId: currentId });
                onSelect?.(currentId);
              }}
            >
              Selected tables: {countSelectedTables()}
            </button>
            <button
              className="absolute top-2 right-2 btn btn-circle btn-sm"
              onClick={() => setEditing(true)}
            >
              <Pencil size={btnSize} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative p-2 mt-3 h-fit">
              <ShowTable
                colors={colors}
                title={title}
                settings={settings}
                saveSettings={saveSettings}
                tableType={tableType}
                setTableType={setTableType}
                resetTable={currentId ? undefined : resetTable}
                isTouch={isTouch}
                onClose={() => setEditing(false)}
                withTopPanel={true}
                bgTable="rgb(210,210,210, 0.5)"
              />
            </div>
            <div className="p-2 rounded-lg border shadow-lg border-primary bg-paper">
              <form className="space-y-2 min-w-72" onSubmit={handleSubmit}>
                <input type="hidden" name="currentId" value={currentId ?? ""} />
                <div className="form-control">
                  <label htmlFor="title" className="label">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold label-text">Name</span>

                      <button
                        type="button"
                        className="btn btn-circle btn-sm"
                        onClick={() => setShowColors(!showColors)}
                      >
                        {showColors ? (
                          <ArrowBigUpDash size={btnSize} />
                        ) : (
                          <Palette size={btnSize} />
                        )}
                      </button>
                    </div>
                  </label>
                  <input
                    className="input input-bordered"
                    type="text"
                    id="titleGroup"
                    name="titleGroup"
                    placeholder="Group name"
                    value={title}
                    onChange={changeTitle}
                    required
                  />
                </div>
                {showColors && (
                  <>
                    <ModifyColor
                      label="Border color"
                      name="borderColor"
                      value={colors.borderColor}
                      defaultValue={DEFAULT_COLORS.borderColor}
                      // themeColors={themeColors}
                      onChange={changeColor}
                    />
                    <ModifyColor
                      label="Background color"
                      name="fillColor"
                      value={colors.fillColor}
                      defaultValue={DEFAULT_COLORS.fillColor}
                      themeColors={themeColors}
                      onChange={changeColor}
                    />
                    <ModifyColor
                      label="Number color"
                      name="numberColor"
                      value={colors.numberColor}
                      defaultValue={DEFAULT_COLORS.numberColor}
                      themeColors={themeColors}
                      onChange={changeColor}
                    />
                    <ModifyColor
                      label="Text color"
                      name="textColor"
                      value={colors.textColor}
                      defaultValue={DEFAULT_COLORS.textColor}
                      themeColors={themeColors}
                      onChange={changeColor}
                    />
                  </>
                )}
                <div
                  className={cn(
                    "items-center card-actions",
                    { "justify-between": currentId },
                    { "justify-center": !currentId }
                  )}
                >
                  {currentId && (
                    <DeleteWithConfirm
                      confirmClassName="p-2 m-1 btn btn-sm"
                      className="btn btn-warning btn-sm"
                      position="right"
                      onConfirm={() => {
                        resetTable();
                        deleteGroup(currentId);
                        setCurrentId(null);
                      }}
                    >
                      <Trash2 size={btnSize} />
                    </DeleteWithConfirm>
                  )}

                  <button className="btn btn-primary" type="submit">
                    {currentId === null ? "Creat" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
