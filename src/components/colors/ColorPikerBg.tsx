import { SliderPicker } from "react-color";
import { RangeInput } from "../atom/RangeInput";
import { ColorInput } from "./ColorInput";
import { X } from "lucide-react";
import { useState } from "react";
import { adjustBrightness } from "@/lib/utils/colors";
import { ColorResult } from "react-color";

interface ColorPikerBgProps {
  style?: React.CSSProperties;
  className?: string;
  title: string;
  closeColorPicker: () => void;
  color: string;
  setColor: (color: string) => void;
}
export const ColorPikerBg = ({
  style,
  className = "absolute p-3 bg-gray-100 rounded-lg border border-gray-400 shadow-xl",
  title,
  closeColorPicker,
  color,
  setColor,
}: ColorPikerBgProps) => {
  const [baseColor, setBaseColor] = useState(color);
  const [intensity, setIntensity] = useState(0);

  const handleSetColor = (color: string) => {
    setBaseColor(color);
    setColor(color);
    setIntensity(0);
  };
  const handleColorChange = (color: ColorResult) => {
    handleSetColor(color.hex);
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    setColor(adjustBrightness(baseColor, newIntensity));
  };

  return (
    <div className={className} style={style}>
      <div className="flex flex-col gap-y-4 justify-center items-center w-44">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold">{title}</span>
          <button
            className="absolute right-1 btn btn-sm btn-circle"
            onClick={closeColorPicker}
          >
            <X size={14} />
          </button>
        </div>
        <SliderPicker
          color={color}
          onChange={handleColorChange}
          className="w-11/12"
        />
        <RangeInput
          id="background-range"
          label="Darkness"
          min="-50"
          max="50"
          step="1"
          value={-intensity}
          onChange={(v) => handleIntensityChange(-v)}
          className="w-28"
        />

        <ColorInput color={color} onChange={handleSetColor} />
      </div>
    </div>
  );
};
