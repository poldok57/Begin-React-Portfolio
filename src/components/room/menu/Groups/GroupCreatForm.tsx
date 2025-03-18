import { useState, useEffect } from "react";
import { GroupTable, TableColors, TableSettings, TableType } from "../../types";
import { ShowTable } from "../../Tables/ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "@/lib/stores/groups";
import {
  Palette,
  ArrowBigUpDash,
  Trash2,
  Save,
  FolderOpen,
} from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { GroupActiveToggle } from "./GroupActiveToggle";

import { cn } from "@/lib/utils/cn";
import { SelectTableColors, DEFAULT_COLORS } from "./SelectTableColors";
import {
  TableTemplate,
  useTableTemplateStore,
} from "@/lib/stores/tableTemplates";
import { menuRoomContainer } from "@/styles/menu-variants";
import { TableTemplateList } from "./TableTemplateList";
import { withMousePosition } from "@/components/windows/withMousePosition";

const TableTemplateListWP = withMousePosition(TableTemplateList);

export const GroupCreatForm = ({
  groupId,
  setEditing,
  onSubmit,
  btnSize = 16,
}: {
  groupId: string | null;
  setEditing: (editing: boolean) => void;
  onSubmit?: (newGroupId: string) => void;
  btnSize?: number;
}) => {
  const { addGroup, updateGroup, deleteGroup, groups } = useGroupStore();
  if (groupId === "new") {
    groupId = null;
  }
  const [currentId, setCurrentId] = useState<string | null>(groupId ?? null);
  const [title, setTitle] = useState("");
  const [colors, setColors] = useState<TableColors>(DEFAULT_COLORS);
  const [settings, setSettings] = useState<TableSettings | null>(null);
  const [showColors, setShowColors] = useState(true);
  // const [showTemplateList, setShowTemplateList] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateList, setShowTemplateList] = useState(false);

  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);

  const { addTemplate } = useTableTemplateStore();

  const getGroup = (id: string) => {
    return groups.find((group) => group.id === id);
  };
  const isTouch = isTouchDevice();
  const [tableType, setTableType] = useState<TableType>(TableType.poker);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = event.target as HTMLFormElement;

    const groupData: GroupTable = {
      id: input.currentId.value,
      title: input.titleGroup.value,
      type: tableType,
      colors: { ...colors },
      settings: undefined,
      isActive: true, // By default, new groups are active
    };
    if (currentId === null) {
      if (settings) {
        groupData.settings = settings;
      }
      const newId = addGroup(groupData);
      setCurrentId(newId);
      if (onSubmit) {
        onSubmit(newId);
      }
    } else {
      // Preserve the current value of isActive when updating
      const currentGroup = getGroup(currentId);
      if (currentGroup) {
        groupData.isActive = currentGroup.isActive;
      }
      // Update the group
      updateGroup(currentId, groupData);
      // Then call onSubmit
      if (onSubmit) {
        onSubmit(currentId);
      }
    }
  };
  const saveSettings = (newSettings: TableSettings) => {
    setSettings(newSettings);

    if (currentId) {
      updateGroup(currentId, {
        settings: newSettings,
        type: tableType,
      });
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

  // Function to toggle the active status of a group
  const toggleGroupActive = (groupId: string, newIsActive?: boolean) => {
    const group = getGroup(groupId);
    if (group) {
      // If newIsActive is provided, use this value, otherwise invert the current state
      const updatedIsActive =
        newIsActive !== undefined ? newIsActive : !(group.isActive !== false);

      console.log(
        `Status of group ${groupId} changed from ${group.isActive} to ${updatedIsActive}`
      );
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

  useEffect(() => {
    if (groupId) {
      setCurrentId(groupId);
      selectGroup(groupId);
      // setEditing(true);
      setShowColors(true);
    }
  }, [groupId]);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    addTemplate({
      name: templateName,
      type: tableType,
      colors: { ...colors },
      settings: settings || undefined,
    });

    setShowSaveTemplateForm(false);
    setTemplateName("");
  };

  const handleSelectTemplate = (template: TableTemplate) => {
    setColors(template.colors);
    setTableType(template.type);
    if (template.settings) {
      setSettings(template.settings);
    }
    setShowColors(true);
    setShowTemplateList(false);
  };

  // if (!currentId) return null;
  // Obtain the current group
  const currentGroup = currentId ? getGroup(currentId) : undefined;

  return (
    <>
      <div className="relative p-2 h-fit">
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
        <form className="space-y-1 min-w-72" onSubmit={handleSubmit}>
          <input type="hidden" name="currentId" value={currentId ?? ""} />
          <div className="form-control">
            {/* Buttons for templates */}
            <div className="flex gap-2 justify-center mt-1">
              {!showTemplateList && (
                <button
                  type="button"
                  className="flex gap-1 items-center btn btn-sm btn-outline"
                  onClick={() => setShowTemplateList(true)}
                >
                  <FolderOpen size={btnSize} />
                  Load a template
                </button>
              )}
              {showColors ? (
                <button
                  type="button"
                  className="flex gap-1 items-center btn btn-sm btn-outline"
                  onClick={() => setShowColors(!showColors)}
                >
                  <ArrowBigUpDash size={btnSize} />
                  Close colors
                </button>
              ) : (
                <button
                  type="button"
                  className="flex gap-1 items-center btn btn-sm btn-outline"
                  onClick={() => setShowColors(!showColors)}
                >
                  <Palette size={btnSize} />
                  Select colors
                </button>
              )}
            </div>
            <label htmlFor="title" className="label">
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold label-text">Name</span>
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

          {/* Option for activate/deactivate the group */}
          {currentId && (
            <div className="flex justify-center items-center form-control">
              <label className="flex gap-2 items-center cursor-pointer label">
                <GroupActiveToggle
                  group={currentGroup}
                  onToggle={(isActive) =>
                    currentId && toggleGroupActive(currentId, isActive)
                  }
                />
              </label>
            </div>
          )}

          {showColors && (
            <SelectTableColors
              changeColor={changeColor}
              colors={colors}
              themeColors={themeColors}
            />
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

      {/* Buttons for templates */}
      {showColors && (
        <div className="flex gap-2 justify-center mt-4">
          <button
            className="flex gap-2 items-center btn btn-sm btn-outline"
            onClick={() => setShowSaveTemplateForm(true)}
          >
            <Save size={btnSize} />
            Save as template
          </button>
        </div>
      )}

      {/* Form for saving a template */}
      {showSaveTemplateForm && (
        <div className="p-4 mt-4 rounded-lg border shadow-lg border-primary">
          <h3 className="mb-2 text-lg font-semibold">Save as template</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Template name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowSaveTemplateForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Liste des templates */}
      {showTemplateList && (
        <TableTemplateListWP
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateList(false)}
          className={menuRoomContainer({ alignement: "translateRight" })}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Table templates"
          titleHidden={false}
          titleBackground={"#ff5a1E"}
          draggable={true}
        />
      )}
    </>
  );
};
