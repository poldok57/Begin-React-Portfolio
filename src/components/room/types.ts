export enum TableType {
  poker = "poker",
  blackjack = "blackjack",
  roulette = "roulette",
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

import {
  RectPosition as Position,
  Rectangle,
  Coordinate,
} from "@/lib/canvas/types";

export interface Table {
  size?: number;
  rotation?: number;
  tableNumber?: string;
  tableText?: string;
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
}

export interface TableData extends Table {
  id: string;
  groupId?: string | null;
  type: TableType;
  selected: boolean;
  position: Position;
  offset?: Position | null;
  settings?: TableSettings | null;
}

export interface GroupTable {
  id: string;
  title?: string;
  tables?: Table[];
  colors: TableColors;
  settings?: TableSettings;
}

export interface DesignElement {
  id: string;
  type: DesignType;
  name: string;
  rect: Rectangle;
  color: string;
  opacity?: number;
  lineWidth?: number;
  point1?: Coordinate;
  point2?: Coordinate;
  point3?: Coordinate;
}
