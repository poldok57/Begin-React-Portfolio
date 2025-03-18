/*
 *  Template list for tables
 *  This component is used to display a list of templates for tables
 *  It is used in the GroupCreat component
 * @author [@GuyRump](https://github.com/Poldok57) with Claude-37-Sonnet
 * @version 1.0.0
 */
import React, { useState, useMemo, useRef } from "react";
import {
  useTableTemplateStore,
  TableTemplate,
} from "@/lib/stores/tableTemplates";
import { getTableComponent } from "../../Tables/ShowTable";
import { Trash2, Filter, Download, Upload, Shuffle } from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { menuRoomVariants } from "@/styles/menu-variants";
import { isTouchDevice } from "@/lib/utils/device";
import { TableType } from "../../types";
import { generateMultipleColorSchemes } from "@/lib/utils/colorUtils";

interface TableTemplateListProps {
  onSelectTemplate: (template: TableTemplate) => void;
}

export const TableTemplateList: React.FC<TableTemplateListProps> = ({
  onSelectTemplate,
}) => {
  const { templates, deleteTemplate, addTemplate } = useTableTemplateStore();
  const isTouch = isTouchDevice();
  const btnSize = isTouch ? 20 : 16;
  const [selectedType, setSelectedType] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Filter templates by type
  const filteredTemplates = useMemo(() => {
    if (selectedType === "all") {
      return templates;
    }
    return templates.filter((template) => template.type === selectedType);
  }, [templates, selectedType]);

  // Get unique table types for the select box
  const uniqueTableTypes = useMemo(() => {
    const types = new Set<string>();
    templates.forEach((template) => {
      types.add(template.type);
    });
    return Array.from(types);
  }, [templates]);

  // Function to create random templates
  const createRandomTemplates = () => {
    try {
      setMessage({ text: "Creating random templates...", type: "info" });

      // Determine the table type to use
      const tableType =
        selectedType !== "all" ? (selectedType as TableType) : TableType.poker;

      // Generate 6 color schemes ensuring no duplicates
      const colorSchemes = generateMultipleColorSchemes(6);

      // Create 6 random templates with unique color schemes
      colorSchemes.forEach((colorScheme, index) => {
        const colorName = colorScheme.colorName || `Color ${index + 1}`;
        addTemplate({
          name: `${colorName} ${tableType}`,
          type: tableType as TableType,
          colors: colorScheme,
          settings: null,
        });
      });

      setMessage({
        text: "6 random templates created successfully!",
        type: "success",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error creating random templates:", error);
      setMessage({
        text: `Error creating: ${(error as Error).message}`,
        type: "error",
      });
    }
  };

  // Function to export templates
  const handleExportTemplates = () => {
    try {
      // Create an object with the templates to export
      const templatesData = {
        templates: selectedType === "all" ? templates : filteredTemplates,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      // Convert to JSON
      const jsonData = JSON.stringify(templatesData, null, 2);

      // Create a blob and a download link
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create an element a for the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `table-templates-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ text: "Templates exported successfully", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error exporting templates:", error);
      setMessage({
        text: `Error exporting: ${(error as Error).message}`,
        type: "error",
      });
    }
  };

  // Function to open the file selector
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Function to import templates
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage({ text: "Import in progress...", type: "info" });

      // Read the file
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Check that the format is correct
          if (!data.templates || !Array.isArray(data.templates)) {
            throw new Error("Invalid file format");
          }

          // Add each template
          let importCount = 0;
          data.templates.forEach((template: TableTemplate) => {
            // Check that the template has the required properties
            if (template.name && template.type && template.colors) {
              addTemplate(template);
              importCount++;
            }
          });

          setMessage({
            text: `${importCount} templates imported successfully`,
            type: "success",
          });

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Error parsing the file:", error);
          setMessage({
            text: `Error importing: ${(error as Error).message}`,
            type: "error",
          });
        }
      };

      reader.onerror = () => {
        setMessage({
          text: "Error reading the file",
          type: "error",
        });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing templates:", error);
      setMessage({
        text: `Error importing: ${(error as Error).message}`,
        type: "error",
      });
    }
  };

  return (
    <div className={menuRoomVariants({ width: 96 })}>
      <div className="flex flex-col gap-2 p-2 rounded-lg border-2 border-accent">
        <h2 className="text-xl font-bold">Table templates</h2>
      </div>

      {/* Notification message */}
      {message && (
        <div
          className={`p-2 mb-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Select box to filter by table type */}
      <div className="flex gap-2 items-center mb-4">
        <Filter size={btnSize} className="text-gray-500" />
        <select
          className="flex-1 select select-bordered select-sm"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All table types</option>
          {uniqueTableTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {templates.length === 0
            ? "No template saved"
            : "No template matches the selected type"}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {filteredTemplates.map((template) => {
            const TableComponent = getTableComponent(template.type);
            return (
              <div
                key={template.id}
                className="flex relative flex-col gap-3 justify-center items-center p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
              >
                <h3 className="w-full text-base font-semibold text-center truncate">
                  {template.name}
                </h3>
                <div className="flex flex-col justify-center items-center w-full bg-gray-50 rounded-md">
                  <TableComponent
                    size={80}
                    rotation={0}
                    type={template.type}
                    tableNumber="88"
                    tableText={template.name}
                    {...template.colors}
                    {...template.settings}
                    onClick={() => onSelectTemplate(template)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className="flex gap-1 justify-between w-full">
                  <button
                    className="flex-1 btn btn-xs btn-primary"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Select
                  </button>
                  <DeleteWithConfirm
                    onConfirm={() => deleteTemplate(template.id)}
                    confirmMessage="Delete this template?"
                    className="btn btn-xs btn-ghost text-error"
                  >
                    <Trash2 size={btnSize - 2} />
                  </DeleteWithConfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Export, import, and random templates buttons */}
      <div className="flex gap-2 justify-between py-2 mt-2">
        <button
          className="flex gap-1 items-center btn btn-sm btn-outline"
          onClick={handleExportTemplates}
          disabled={templates.length === 0}
          title={
            templates.length === 0
              ? "No template to export"
              : "Export templates"
          }
        >
          <Download size={btnSize} />
          Export
        </button>

        <button
          className="flex gap-1 items-center btn btn-sm btn-outline btn-success"
          onClick={createRandomTemplates}
          title="Create random templates"
        >
          <Shuffle size={btnSize} />
          Random templates
        </button>

        <button
          className="flex gap-1 items-center btn btn-sm btn-outline"
          onClick={handleImportClick}
          title="Import templates"
        >
          <Upload size={btnSize} />
          Import
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
};
