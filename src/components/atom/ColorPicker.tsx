import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    setColor(defaultValue || "#000000");
  }, [defaultValue]);

  return (
    <div className="inline-block relative m-0">
      <input
        id={id}
        ref={pickerRef}
        type="color"
        value={color}
        onChange={handleColorChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div
        className={clsx(
          "inline-block border cursor-pointer opacity-1",
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
