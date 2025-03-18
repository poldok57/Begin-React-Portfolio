import { useState } from "react";
import { ModifyColor } from "./ModifyColor";
import { TableColors } from "../../types";
export const DEFAULT_COLORS = {
  borderColor: "#333333",
  fillColor: "#aaaaaa",
  numberColor: "#000000",
  textColor: "#111199",
};

interface SelectTableColorsProps {
  changeColor: (event: React.ChangeEvent<HTMLInputElement>) => void;
  colors: TableColors;
  themeColors: string[];
}

export const SelectTableColors = ({
  changeColor,
  colors,
  themeColors,
}: SelectTableColorsProps) => {
  const [openedInputColor, setOpenedInputColor] = useState<string | null>(null);

  return (
    <>
      <ModifyColor
        label="Border color"
        name="borderColor"
        value={colors.borderColor}
        defaultValue={DEFAULT_COLORS.borderColor}
        // themeColors={themeColors}
        onChange={changeColor}
        openedInputColor={openedInputColor}
        setOpenedInputColor={setOpenedInputColor}
      />
      <ModifyColor
        label="Background color"
        name="fillColor"
        value={colors.fillColor}
        defaultValue={DEFAULT_COLORS.fillColor}
        themeColors={themeColors}
        onChange={changeColor}
        openedInputColor={openedInputColor}
        setOpenedInputColor={setOpenedInputColor}
      />
      <ModifyColor
        label="Number color"
        name="numberColor"
        value={colors.numberColor}
        defaultValue={DEFAULT_COLORS.numberColor}
        themeColors={themeColors}
        onChange={changeColor}
        openedInputColor={openedInputColor}
        setOpenedInputColor={setOpenedInputColor}
      />
      <ModifyColor
        label="Text color"
        name="textColor"
        value={colors.textColor}
        defaultValue={DEFAULT_COLORS.textColor}
        themeColors={themeColors}
        onChange={changeColor}
        openedInputColor={openedInputColor}
        setOpenedInputColor={setOpenedInputColor}
      />
    </>
  );
};
