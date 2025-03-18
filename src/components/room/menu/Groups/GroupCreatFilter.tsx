import { Filter, Check, X, ListFilter } from "lucide-react";
import { useState } from "react";

export type ActiveStatus = "active" | "inactive" | "all";

// Function to get the display name of a table type
export const getTableTypeDisplayName = (type: string): string => {
  if (type === "roulette") {
    return "Roulette";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Function to normalize table types (group Roulette and RouletteL)
export const normalizeTableType = (type: string): string => {
  // If the type starts with "roulette", normalize it to "roulette"
  if (type && type.toLowerCase().startsWith("roulette")) {
    return "roulette";
  }
  return type;
};

interface GroupCreatFilterProps {
  activeFilter: ActiveStatus;
  setActiveFilter: (activeFilter: ActiveStatus) => void;
  typeFilter: string;
  setTypeFilter: (typeFilter: string) => void;
  uniqueTableTypes: string[];
  btnSize: number;
}

export const GroupCreatFilter = ({
  activeFilter,
  setActiveFilter,
  typeFilter,
  setTypeFilter,
  uniqueTableTypes,
  btnSize,
}: GroupCreatFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Function to change the active status
  const cycleActiveStatus = () => {
    if (activeFilter === "active") setActiveFilter("inactive");
    else if (activeFilter === "inactive") setActiveFilter("all");
    else setActiveFilter("active");
  };

  // Function to get the active status icon
  const getActiveStatusIcon = () => {
    switch (activeFilter) {
      case "active":
        return (
          <>
            <Check size={btnSize} className="text-success" /> Active
          </>
        );
      case "inactive":
        return (
          <>
            <X size={btnSize} className="text-error" /> Inactive
          </>
        );
      case "all":
        return (
          <>
            <ListFilter size={btnSize} className="text-info" /> All
          </>
        );
    }
  };

  return (
    <>
      {/* Filtres  */}

      <div className="flex gap-2 justify-between items-center mb-2">
        <button
          className="flex gap-1 items-center btn btn-sm btn-outline"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter groups"
        >
          <Filter size={btnSize} />
          Filters
        </button>

        <div className="flex gap-1 items-center">
          <button
            className="flex gap-1 items-center btn btn-sm btn-ghost"
            onClick={cycleActiveStatus}
            title={`Statut: ${
              activeFilter === "active"
                ? "Active"
                : activeFilter === "inactive"
                ? "Inactive"
                : "All"
            }`}
          >
            {getActiveStatusIcon()}
          </button>
        </div>
      </div>

      {/* Filters panel - Hidden in selectOnly mode */}
      {showFilters && (
        <div className="p-2 mb-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-1 pr-4 border-r border-gray-300">
              <label className="text-sm font-medium">Statut:</label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`btn btn-xs ${
                    activeFilter === "active" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setActiveFilter("active")}
                >
                  Actif
                </button>
                <button
                  className={`btn btn-xs ${
                    activeFilter === "inactive" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setActiveFilter("inactive")}
                >
                  Inactive
                </button>
                <button
                  className={`btn btn-xs ${
                    activeFilter === "all" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  All
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Table type:</label>
              <select
                className="mt-1 w-full select select-bordered select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All types</option>
                {uniqueTableTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTableTypeDisplayName(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
