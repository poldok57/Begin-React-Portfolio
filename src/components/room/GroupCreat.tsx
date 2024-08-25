import { useState, useRef, useEffect } from "react";
import { GroupTable, TableColors, TableSettings } from "./types";
import { ShowTable } from "./ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "./stores/groups";

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
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
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
      <input
        type="color"
        id={name}
        name={name}
        value={color}
        onChange={handleChange}
        className="w-40 h-10 input input-bordered"
      />
    </div>
  );
};

export const GroupCreat = () => {
  const { addGroup, updateGroup, groups } = useGroupStore();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [colors, setColors] = useState<TableColors>(DEFAULT_COLORS);
  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const currentGroupRef = useRef<GroupTable | undefined>(undefined);
  const isTouch = isTouchDevice();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = event.target as HTMLFormElement;
    const colors: TableColors = {
      borderColor: input.borderColor.value,
      fillColor: input.fillColor.value,
      numberColor: input.numberColor.value,
      textColor: input.textColor.value,
    };
    const group = {
      id: input.currentId.value,
      title: input.titleGroup.value,
      colors: colors,
    };
    if (currentId === null) {
      const newId = addGroup(group);
      setCurrentId(newId);
      currentGroupRef.current = { ...group, ...getGroup(newId) };
      console.log("newId:", newId);
    } else {
      updateGroup(currentId, group);
    }
  };
  const saveSettings = (settings: TableSettings) => {
    console.log("settings:", settings);
    if (!currentGroupRef.current) {
      return;
    }
    currentGroupRef.current.settings = settings;
    updateGroup(currentGroupRef.current.id, currentGroupRef.current);
  };

  const selectGroup = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectId = event.target.value;
    console.log("selected event:", selectId);
    if (selectId === "new") {
      setCurrentId(null);
      setTitle("");
      currentGroupRef.current = undefined;
      return;
    }
    const selectedGroup = getGroup(selectId);
    if (selectedGroup) {
      setCurrentId(selectId);
      currentGroupRef.current = { ...selectedGroup };
      setTitle(selectedGroup?.title ?? "");
      setColors(selectedGroup?.colors ?? DEFAULT_COLORS);
      console.log("currentGroup:", currentGroupRef.current);
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

    if (!currentGroupRef.current) {
      return;
    }
    currentGroupRef.current.colors = newColors;

    console.log(`Couleur ${name} mise à jour:`, value);
  };
  const changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTitle(value);
    if (!currentGroupRef.current) {
      return;
    }
    currentGroupRef.current.title = value;
  };

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
            title={currentGroupRef.current?.title}
            settings={currentGroupRef.current?.settings}
            saveSettings={saveSettings}
            isTouch={isTouch}
          />
        </div>
        <div className="p-2 rounded-lg border shadow-lg border-primary bg-paper">
          <form className="space-y-2 min-w-72" onSubmit={handleSubmit}>
            <input type="hidden" name="currentId" value={currentId ?? ""} />
            <div className="form-control">
              <label htmlFor="title" className="label">
                <span className="label-text">Name</span>
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
            <ModifyColor
              label="Border color"
              name="borderColor"
              value={colors.borderColor}
              defaultValue={DEFAULT_COLORS.borderColor}
              onChange={changeColor}
            />
            <ModifyColor
              label="Background color"
              name="fillColor"
              value={colors.fillColor}
              defaultValue={DEFAULT_COLORS.fillColor}
              onChange={changeColor}
            />
            <ModifyColor
              label="Number color"
              name="numberColor"
              value={colors.numberColor}
              defaultValue={DEFAULT_COLORS.numberColor}
              onChange={changeColor}
            />
            <ModifyColor
              label="Text color"
              name="textColor"
              value={colors.textColor}
              defaultValue={DEFAULT_COLORS.textColor}
              onChange={changeColor}
            />

            <div className="justify-end card-actions">
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
