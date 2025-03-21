import React, { useRef, useState, useEffect } from "react";
import { GithubPicker, SliderPicker, SwatchesPicker } from "react-color";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
// import { getContrastColor } from "./colors";
import { ColorInput } from "./ColorInput";

type Colors = {
  hex: string;
};
interface DisplayColorPickerProps {
  setColor: (fieldName: string, value: string) => void;
  color: string;
  themeColors?: string[];
  themeName?: string;
  fieldName: string;
  label: string;
  withCloseBtn?: boolean;
  withTransparent?: boolean;
  closeColorPicker: () => void;
}
export const DisplayColorPicker: React.FC<DisplayColorPickerProps> = ({
  setColor,
  color,
  themeColors,
  themeName = "Theme colors",
  fieldName,
  label,
  withCloseBtn = false,
  closeColorPicker,
  withTransparent = true,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showSwatches, setShowSwatches] = useState(false);

  const handleClose = () => {
    closeColorPicker();
  };
  const windowHeight = window.innerHeight;

  useEffect(() => {
    if (!withCloseBtn) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeColorPicker, withCloseBtn]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-center p-2 rounded-lg border shadow-xl z-[9999] w-fit min-w-72 bg-base-200 border-base-300",
        "color-picker-popup"
      )}
      ref={pickerRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-row gap-2 justify-between items-center w-full">
        <div className="flex flex-grow justify-center">
          {label && windowHeight > 600 ? (
            <h3 className="flex justify-center text-lg font-bold">{label}</h3>
          ) : null}
        </div>
        {withCloseBtn && (
          <button
            className={cn([
              "btn btn-sm btn-square bg-base-300 border-base-300 hover:border-neutral",
              "translate-x-1 -translate-y-1",
              "transition-opacity duration-300",
            ])}
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <ul className="gap-2 justify-center w-full menu menu-horizontal bg-base-200 rounded-box">
        <li>
          <a
            className={cn({
              "border border-opacity-40 border-neutral bg-base-300":
                !showSwatches,
            })}
            onClick={() => setShowSwatches(false)}
          >
            Selected colors
          </a>
        </li>
        <li>
          <a
            className={cn({
              "border border-opacity-40 border-neutral bg-base-300":
                showSwatches,
            })}
            onClick={() => setShowSwatches(true)}
          >
            More colors
          </a>
        </li>
      </ul>
      {withTransparent && (
        <div className="form-control">
          <label htmlFor={fieldName} className="flex gap-2 items-center">
            <input
              id={fieldName}
              type="checkbox"
              className="toggle toggle-success toggle-sm"
              checked={color === "transparent"}
              onChange={(e) =>
                setColor(fieldName, e.target.checked ? "transparent" : "#888")
              }
            />
            <span className="text-primary">Transparent</span>
          </label>
        </div>
      )}

      {color !== "transparent" && (
        <>
          {showSwatches ? (
            <SwatchesPicker
              width={242}
              onChange={(color: Colors) => setColor(fieldName, color.hex)}
            />
          ) : (
            <>
              <GithubPicker
                width="220px"
                onChange={(color: Colors) => setColor(fieldName, color.hex)}
              />
              {windowHeight > 750 && themeColors ? (
                <>
                  {themeName && (
                    <span className="text-sm font-bold">{themeName}</span>
                  )}
                  <GithubPicker
                    width="220px"
                    colors={themeColors}
                    onChange={(color: Colors) => setColor(fieldName, color.hex)}
                  />
                </>
              ) : null}
              <SliderPicker
                className="w-11/12"
                color={color}
                onChange={(color: Colors) => setColor(fieldName, color.hex)}
              />
            </>
          )}
          <ColorInput
            color={color}
            onChange={(value) => setColor(fieldName, value)}
          />
        </>
      )}
    </div>
  );
};
