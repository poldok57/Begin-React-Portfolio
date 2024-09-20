import React from "react";
import { Trash2 } from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";

interface DeleteSelectedTablesProps {
  btnSize: number;
  selectedTablesCount: number;
  onDelete: () => void;
}

export const DeleteSelectedTables: React.FC<DeleteSelectedTablesProps> = ({
  btnSize,
  selectedTablesCount,
  onDelete,
}) => (
  <DeleteWithConfirm
    className="p-2 btn btn-sm"
    position="right"
    onConfirm={onDelete}
    confirmMessage={`delete ${selectedTablesCount} table${
      selectedTablesCount > 1 ? "s" : ""
    }`}
  >
    <button className="btn btn-circle btn-sm">
      <Trash2 size={btnSize} />
    </button>
  </DeleteWithConfirm>
);
