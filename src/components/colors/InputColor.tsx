import React, { useState, useEffect, useRef } from "react";
import { DisplayColorPicker } from "./DisplayColorPicker";
import clsx from "clsx";

interface InputColorProps {
  label: string;
  fieldName: string;
  color: string;
  themeColors?: string[];
  className: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openedInputColor?: string | null;
  setOpenedInputColor?: (value: string) => void;
}

export const InputColor: React.FC<InputColorProps> = ({
  label,
  fieldName,
  color,
  themeColors,
  onChange,
  className,
  openedInputColor,
  setOpenedInputColor,
}) => {
  const [divColor, setDivColor] = useState(color);
  const [showPicker, setShowPicker] = useState(false);
  const colorButtonRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState<
    "top" | "middle" | "bottom"
  >("middle");
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);

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

  // Déterminer la position verticale et horizontale pour ajuster le picker
  useEffect(() => {
    if (
      showPicker &&
      openedInputColor === fieldName &&
      colorButtonRef.current
    ) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Position verticale
      if (rect.top < viewportHeight / 3) {
        setPickerPosition("top");
      } else if (rect.top > (viewportHeight * 2) / 3) {
        setPickerPosition("bottom");
      } else {
        setPickerPosition("middle");
      }

      // Vérifier si le colorButton est proche du bord droit de l'écran
      // Si on est à moins de 400px du bord droit (taille approximative du picker + marge)
      setIsNearRightEdge(rect.right > viewportWidth - 400);
    }
  }, [showPicker, openedInputColor, fieldName]);

  return (
    <div className="color-input-container">
      <div
        ref={colorButtonRef}
        className={clsx(className, "cursor-pointer")}
        style={{ backgroundColor: divColor }}
        onClick={() => {
          setShowPicker(true);
          setOpenedInputColor?.(fieldName);
        }}
      ></div>
      {showPicker && openedInputColor === fieldName && (
        <div
          className={clsx("color-picker-wrapper", {
            "color-picker-top": pickerPosition === "top",
            "color-picker-middle": pickerPosition === "middle",
            "color-picker-bottom": pickerPosition === "bottom",
            "color-picker-left": isNearRightEdge,
          })}
        >
          <DisplayColorPicker
            color={color}
            fieldName={fieldName}
            label={label}
            themeColors={themeColors}
            themeName={"Table colors"}
            setColor={handleChange}
            withCloseBtn={true}
            withTransparent={false}
            closeColorPicker={() => setShowPicker(false)}
          />
        </div>
      )}
    </div>
  );
};
