import { useState, useEffect } from "react";
import { GroupTable, TableColors, TableSettings, TableType } from "../types";
import { ShowTable, getTableComponent } from "../ShowTable";
import { isTouchDevice } from "@/lib/utils/device";
import { useGroupStore } from "@/lib/stores/groups";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";
import {
  Palette,
  ArrowBigUpDash,
  Trash2,
  Pencil,
  Save,
  FolderOpen,
} from "lucide-react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { ModifyColor } from "../ModifyColor";
import {
  useTableTemplateStore,
  TableTemplate,
} from "@/lib/stores/tableTemplates";
import { TableTemplateList } from "./TableTemplateList";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { menuRoomVariants } from "@/styles/menu-variants";
import { cn } from "@/lib/utils";

const TableTemplateListWP = withMousePosition(TableTemplateList);

const DEFAULT_COLORS = {
  borderColor: "#333333",
  fillColor: "#aaaaaa",
  numberColor: "#000000",
  textColor: "#111199",
};
