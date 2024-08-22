import { useState, useRef, useEffect } from "react";
import { GroupTable, TableColors, TableSettings } from "./types";
import { RangeInput } from "@/components/atom/RangeInput";
import { useGroupStore } from "./stores/groups";
import { PokerTable } from "./PokerTable";
import { Plus, Minus, RotateCcw, RotateCw, Settings } from "lucide-react";
import clsx from "clsx";

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

export const ShowTable = ({
  colors,
  title,
}: {
  colors: TableColors | undefined;
  title: string | undefined;
}) => {
  // states for size and rotation
  const [size, setSize] = useState(200);
  const [rotation, setRotation] = useState(0);
  const [settings, setSettings] = useState(false);
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    widthLine: 0.025,
    heightRatio: 0.28,
    concaveRatio: 0.07,
    textRatio: 0.3,
    textPosition: 0,
    opacity: 0.4,
  });
  const handleSettingsChange = (name: string, value: number) => {
    console.log("name:", name, "value:", value);
    setTableSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };
  // Fonctions pour modifier la rotation et la taille
  const changeRotation = (increment: number) => {
    setRotation((prevRotation) => (prevRotation + increment + 360) % 360);
  };

  const changeSize = (increment: number) => {
    setSize((prevSize) => Math.max(50, Math.min(500, prevSize + increment)));
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex mt-4 space-x-2 z-[1]  mx-4 mb-10">
        <button onClick={() => changeRotation(-15)} className="btn btn-circle">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => changeRotation(15)} className="btn btn-circle">
          <RotateCw size={20} />
        </button>
        <button onClick={() => changeSize(-10)} className="btn btn-circle">
          <Minus size={20} />
        </button>
        <button onClick={() => changeSize(10)} className="btn btn-circle">
          <Plus size={20} />
        </button>
      </div>

      <PokerTable
        size={size}
        rotation={rotation}
        {...colors}
        {...tableSettings}
        tableNumber="88"
        tableText={title}
      />
      <div className="flex flex-col space-x-2 z-[1]  mx-4 mt-10">
        <button
          onClick={() => setSettings(!settings)}
          className="btn btn-circle"
        >
          <Settings size={20} />
        </button>
        <div
          className={clsx("flex flex-row gap-2 justify-between w-full", {
            hidden: settings,
          })}
        >
          <RangeInput
            className="w-20 h-4"
            id="widthLine"
            label="Line"
            value={tableSettings.widthLine || 0}
            min="0.01"
            max="0.08"
            step="0.005"
            onChange={(v) => handleSettingsChange("widthLine", v)}
          />
          <RangeInput
            className="w-20 h-4"
            id="heightRatio"
            label="Height"
            value={tableSettings.heightRatio || 0}
            min="0.1"
            max="0.4"
            step="0.01"
            onChange={(v) => handleSettingsChange("heightRatio", v)}
          />
          <RangeInput
            className="w-20 h-4"
            id="concaveRatio"
            label="Concave"
            value={tableSettings.concaveRatio || 0}
            min="0.00"
            max="0.14"
            step="0.01"
            onChange={(v) => handleSettingsChange("concaveRatio", v)}
          />
        </div>
        <div
          className={clsx("flex flex-row gap-2 justify-between w-full", {
            hidden: settings,
          })}
        >
          <RangeInput
            className="w-20 h-4"
            id="textRatio"
            label="Text"
            value={tableSettings.textRatio || 0}
            min="0.1"
            max="0.4"
            step="0.01"
            onChange={(v) => handleSettingsChange("textRatio", v)}
          />
          <RangeInput
            className="w-20 h-4"
            id="textPosition"
            label="Position"
            value={tableSettings.textPosition || 0}
            min="0"
            max="1"
            step="0.01"
            onChange={(v) => handleSettingsChange("textPosition", v)}
          />
          <RangeInput
            className="w-20 h-4"
            id="opacity"
            label="Opacity"
            value={tableSettings.opacity || 0}
            min="0"
            max="1"
            step="0.01"
            onChange={(v) => handleSettingsChange("opacity", v)}
          />
        </div>
      </div>
    </div>
  );
};

export const GroupCreat = () => {
  const { addGroup, updateGroup, groups } = useGroupStore();

  const [currentId, setCurrentId] = useState<string | null>(null);

  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const currentGroupRef = useRef<GroupTable | undefined>(undefined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = event.target as HTMLFormElement;
    const group = {
      id: input.currentId.value,
      title: input.titleGroup.value,
      colors: {
        borderColor: input.borderColor.value,
        fillColor: input.fillColor.value,
        numberColor: input.numberColor.value,
        textColor: input.textColor.value,
      },
    };
    if (currentId === null) {
      addGroup(group);
    } else {
      updateGroup(currentId, group);
    }
  };
  const selectGroup = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectId = event.target.value;
    console.log("selected event:", selectId);
    if (selectId === "new") {
      setCurrentId(null);
      currentGroupRef.current = undefined;
      return;
    }
    setCurrentId(selectId);
    currentGroupRef.current = getGroup(selectId);
    console.log("currentGroup:", currentGroupRef.current);
  };
  const changeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (!currentGroupRef.current) {
      return;
    }
    currentGroupRef.current.colors[
      name as keyof typeof currentGroupRef.current.colors
    ] = value;
    console.log(`Couleur ${name} mise à jour:`, value);
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
            colors={currentGroupRef.current?.colors}
            title={currentGroupRef.current?.title}
          />
        </div>
        <form className="space-y-4 min-w-72" onSubmit={handleSubmit}>
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
              defaultValue={currentGroupRef.current?.title}
              required
            />
          </div>
          <ModifyColor
            label="Border color"
            name="borderColor"
            value={currentGroupRef.current?.colors.borderColor}
            defaultValue="#333333"
            onChange={changeColor}
          />
          <ModifyColor
            label="Background color"
            name="fillColor"
            value={currentGroupRef.current?.colors.fillColor}
            defaultValue="#aaaaaa"
            onChange={changeColor}
          />
          <ModifyColor
            label="Number color"
            name="numberColor"
            value={currentGroupRef.current?.colors.numberColor}
            defaultValue="#000000"
            onChange={changeColor}
          />
          <ModifyColor
            label="Text color"
            name="textColor"
            value={currentGroupRef.current?.colors.textColor}
            defaultValue="#111199"
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
  );
};
