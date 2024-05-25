import React, { useState } from "react";
import clsx from "clsx";

interface ColorPickerProps {
  id?: string;
  width?: number;
  height?: number;
  defaultValue?: string;
  className?: string;
  onChange?: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  id = "color-picker",
  width = 50,
  height = 30,
  defaultValue,
  className,
  onChange,
}) => {
  const [color, setColor] = useState(defaultValue || "#000000");
  const pickerRef = React.useRef<HTMLInputElement>(null);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setColor(newColor);
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <div className="relative m-0 inline-block">
      <input
        id={id}
        ref={pickerRef}
        type="color"
        value={color}
        onChange={handleColorChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div
        className={clsx(
          "opacity-1 inline-block cursor-pointer border",
          className
        )}
        style={{
          backgroundColor: color,
          width: `${width}px`,
          height: `${height}px`,
        }}
        onClick={() => pickerRef.current?.click()}
      ></div>
    </div>
  );
};
