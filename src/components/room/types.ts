export enum TableType {
  poker = "poker",
  blackjack = "blackjack",
  roulette = "roulette",
  craps = "craps",
  slot = "slot",
  other = "other",
}

export interface Position {
  x: number;
  y: number;
}
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
  groupId?: string;
  type: TableType;
  selected: boolean;
  position?: Position;
  settings?: TableSettings;
}

export interface GroupTable {
  id: string;
  title?: string;
  tables?: Table[];
  colors: TableColors;
  settings?: TableSettings;
}
