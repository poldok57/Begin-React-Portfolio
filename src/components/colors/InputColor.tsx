import React, { useState, useEffect } from "react";
import { DisplayColorPicker } from "./DisplayColorPicker";

interface InputColorProps {
  label: string;
  fieldName: string;
  color: string;
  className: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputColor: React.FC<InputColorProps> = ({
  label,
  fieldName,
  color,
  onChange,
  className,
}) => {
  const [divColor, setDivColor] = useState(color);
  const [showPicker, setShowPicker] = useState(false);
  const handleChange = (name: string, color: string) => {
    setDivColor(color);
    const event = {
      target: {
        name: name,
        value: color,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  useEffect(() => {
    setDivColor(color);
  }, [color]);

  return (
    <>
      <div
        className={className}
        style={{ backgroundColor: divColor }}
        onClick={() => setShowPicker(true)}
      ></div>
      {showPicker && (
        <DisplayColorPicker
          color={color}
          memoColor={color}
          fieldName={fieldName}
          label={label}
          setColor={handleChange}
          withCloseBtn={true}
          withTransparent={false}
          closeColorPicker={() => setShowPicker(false)}
        />
      )}
    </>
  );
};
