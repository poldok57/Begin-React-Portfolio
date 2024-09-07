import { useState, useEffect } from "react";
import { InputColor } from "../colors/InputColor";

export const ModifyColor = ({
  label,
  name,
  value,
  defaultValue,
  themeColors,
  className = "w-40 h-10 input input-bordered",
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  className?: string;
  themeColors?: string[];
  defaultValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [color, setColor] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    onChange(e);
  };
  useEffect(() => {
    setColor(value || defaultValue);
  }, [value, defaultValue]);

  return (
    <div className="flex flex-row justify-between items-center form-control">
      <label className="items-center ml-auto text-center label">
        <span className="label-text">{label}</span>
      </label>

      <InputColor
        label={label}
        fieldName={name}
        color={color}
        themeColors={themeColors}
        onChange={handleChange}
        className={className}
      />
    </div>
  );
};
