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
  position: {
    x: number;
    y: number;
  };
  groupId?: string;
}

export interface GroupTable {
  id: string;
  title?: string;
  tables?: Table[];
  colors: TableColors;
  settings?: TableSettings;
}
