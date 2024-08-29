import { useState, useEffect } from "react";
import { GroupTable, TableColors, TableSettings } from "./types";
import { ShowTable } from "./ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "./stores/groups";
import { InputColor } from "../colors/InputColor";
import { Palette, ArrowBigUpDash, Trash2 } from "lucide-react";
import { DeleteWithConfirm } from "../atom/DeleteWithConfirm";

const DEFAULT_COLORS = {
  borderColor: "#333333",
  fillColor: "#aaaaaa",
  numberColor: "#000000",
  textColor: "#111199",
};

const ModifyColor = ({
  label,
  name,
  value,
  defaultValue,
  themeColors,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  themeColors?: string[];
  defaultValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [color, setColor] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    onChange(e);
  };
  useEffect(() => {
    setColor(value || defaultValue);
  }, [value, defaultValue]);

  return (
    <div className="flex flex-row justify-between form-control">
      <label htmlFor="borderColor" className="ml-auto label">
        <span className="label-text">{label}</span>
      </label>

      <InputColor
        label={label}
        fieldName={name}
        color={color}
        themeColors={themeColors}
        onChange={handleChange}
        className="w-40 h-10 input input-bordered"
      />
    </div>
  );
};

export const GroupCreat = () => {
  const { addGroup, updateGroup, deleteGroup, groups } = useGroupStore();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [colors, setColors] = useState<TableColors>(DEFAULT_COLORS);
  const [settings, setSettings] = useState<TableSettings | null>(null);
  const [showColors, setShowColors] = useState(false);
  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const isTouch = isTouchDevice();
  const btnSize = isTouch ? 20 : 16;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = event.target as HTMLFormElement;

    const group: GroupTable = {
      id: input.currentId.value,
      title: input.titleGroup.value,
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
      });
    }
  };

  const selectGroup = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectId = event.target.value;
    // console.log("selected event:", selectId);
    if (selectId === "new") {
      setCurrentId(null);
      resetTable();
      setShowColors(true);
      return;
    }
    const selectedGroup = getGroup(selectId);
    if (selectedGroup) {
      setCurrentId(selectId);
      setTitle(selectedGroup?.title ?? "");
      setColors(selectedGroup?.colors ?? DEFAULT_COLORS);
      setSettings(selectedGroup?.settings ?? null);
    } else {
      console.error("Groupe non trouvé");
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

  return (
    <div className="w-96 shadow-xl card bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Group or Tournament</h2>
        <p>
          <select
            className="w-full max-w-xs select select-primary"
            onChange={(e) => selectGroup(e)}
          >
            <option disabled selected>
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
        <div>
          <ShowTable
            colors={colors}
            title={title}
            settings={settings}
            saveSettings={saveSettings}
            resetTable={resetTable}
            isTouch={isTouch}
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
            <div className="justify-between items-center card-actions">
              {currentId ? (
                <DeleteWithConfirm
                  className="p-2 m-1 btn btn-sm"
                  position="right"
                  onConfirm={() => {
                    resetTable();
                    deleteGroup(currentId);
                    setCurrentId(null);
                  }}
                >
                  <button className="btn btn-warning btn-sm">
                    <Trash2 size={btnSize} />
                  </button>
                </DeleteWithConfirm>
              ) : (
                <></>
              )}

              <button className="btn btn-primary" type="submit">
                {currentId === null ? "Creat" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
