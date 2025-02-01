import {
  RectPosition as Position,
  Rectangle,
  Coordinate,
} from "@/lib/canvas/types";

export enum TableType {
  poker = "poker",
  blackjack = "blackjack",
  roulette = "roulette",
  rouletteL = "rouletteL",
  craps = "craps",
  slot = "slot",
  other = "other",
}

export enum DesignType {
  background = "background",
  square = "square",
  line = "line",
  arc = "arc",
  text = "text",
  image = "image",
}

export enum Menu {
  addTable = "addTable",
  updateTable = "updateTable",
  tableNumbers = "tableNumbers",
  roomDesign = "roomDesign",
  scale = "scale",
}

export enum Mode {
  draw = "draw",
  create = "create",
  numbering = "numbering",
  settings = "settings",
}

export interface Table {
  size?: number;
  rotation?: number;
  type: TableType;
  tableNumber?: string;
  tableText?: string;
}

export enum TypeListTables {
  plan = "plan",
  list = "list",
  hide = "hide",
}

export interface TableColors {
  borderColor?: string;
  fillColor?: string;
  numberColor?: string;
  textColor?: string;
}

export interface TableSettings {
  widthLine?: number;
  heightRatio?: number;
  concaveRatio?: number;
  textRatio?: number;
  // textPosition?: number;
  opacity?: number;
}

export interface TableProps extends Table, TableColors, TableSettings {
  flashDuration?: number;
  flashDelay?: number;
  style?: React.CSSProperties;
}

export interface TableData extends Table {
  id: string;
  groupId?: string | null;
  selected: boolean;
  position: Position;
  settings?: TableSettings | null;
}

export interface GroupTable {
  id: string;
  title?: string;
  type: TableType;
  tables?: Table[];
  colors: TableColors;
  settings?: TableSettings;
}

export interface DesignElement {
  id: string;
  type: DesignType;
  name: string;
  rect: Rectangle | null;
  color: string;
  opacity?: number;
  lineWidth?: number;
  rotation?: number; // Angle de rotation en degrés
  point1?: Coordinate;
  point2?: Coordinate;
  point3?: Coordinate;
}
