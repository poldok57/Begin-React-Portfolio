import React from "react";
import { GroupTable } from "../../types";

interface GroupActiveToggleProps {
  group: GroupTable | undefined;
  onToggle: (isActive: boolean) => void;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const GroupActiveToggle: React.FC<GroupActiveToggleProps> = ({
  group,
  onToggle,
  showLabel = true,
  size = "md",
}) => {
  if (!group) return null;

  const isActive = group.isActive !== false;

  // Déterminer les classes en fonction de la taille
  const toggleSizeClass =
    size === "sm" ? "toggle-sm" : size === "lg" ? "toggle-lg" : "";

  // Déterminer les classes en fonction du statut
  const toggleStatusClass = isActive
    ? "toggle-success border-2 border-success"
    : "bg-red-600 border-4 border-red-600";

  return (
    <div className="flex gap-2 items-center">
      {showLabel && (
        <span
          className={`font-semibold label-text ${
            size === "sm" ? "text-sm" : ""
          }`}
        >
          Actif
        </span>
      )}
      <input
        type="checkbox"
        className={`toggle ${toggleSizeClass} ${toggleStatusClass}`}
        checked={isActive}
        onChange={() => onToggle(!isActive)}
      />
    </div>
  );
};
