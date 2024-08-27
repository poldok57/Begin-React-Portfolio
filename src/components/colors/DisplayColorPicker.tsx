import React, { useRef, useState, useEffect } from "react";
import { GithubPicker, SliderPicker, SwatchesPicker } from "react-color";
import { Copy, Undo2, X } from "lucide-react";
import clsx from "clsx";
import { getContrastColor } from "./colors";

type Colors = {
  hex: string;
};
interface DisplayColorPickerProps {
  setColor: (fieldName: string, value: string) => void;
  color: string;
  themeColors?: string[];
  memoColor: string;
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
  memoColor,
  fieldName,
  label,
  withCloseBtn = false,
  closeColorPicker,
  withTransparent = true,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showSwatches, setShowSwatches] = useState(false);
  const handleCopyColor = () => {
    navigator.clipboard.writeText(memoColor);
  };
  const windowHeight = window.innerHeight;

  useEffect(() => {
    if (!withCloseBtn) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        closeColorPicker();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeColorPicker, withCloseBtn]);

  useEffect(() => {
    if (!pickerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeColorPicker();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="flex z-20 flex-col gap-2 items-center p-2 rounded-lg border w-fit bg-base-200 border-base-200"
      ref={pickerRef}
    >
      <div className="flex flex-row gap-2 justify-between items-center w-full">
        <div className="flex flex-grow justify-center">
          {label && windowHeight > 600 ? (
            <h3 className="flex justify-center text-lg font-bold">{label}</h3>
          ) : null}
        </div>
        {withCloseBtn && (
          <button
            className={clsx([
              "btn btn-sm btn-square bg-base-300 border-base-300 hover:border-neutral",
              "translate-x-1 -translate-y-1",
              "transition-opacity duration-300",
            ])}
            onClick={closeColorPicker}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <ul className="w-full menu menu-horizontal bg-base-200 rounded-box">
        <li>
          <a
            className={clsx({
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
            className={clsx({
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
              width="242px"
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
                  Theme colors
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
                disableAlpha={true}
                onChange={(color: Colors) => setColor(fieldName, color.hex)}
              />
            </>
          )}
          <div className="flex relative gap-2 justify-center items-center">
            <button
              className="btn btn-sm"
              onClick={() => setColor(fieldName, memoColor)}
              title="Back to initial color"
              style={{ backgroundColor: memoColor }}
            >
              <Undo2 size={16} color={getContrastColor(memoColor)} />
            </button>
            <input
              type="text"
              className="p-3 m-2 w-11/12 rounded-md border border-gray-300 bg-base-100 focus:border-gray-800"
              value={color}
              onChange={(e) => setColor(fieldName, e.target.value)}
            />
            <button
              className="absolute right-2 p-2 m-2 btn btn-sm"
              onClick={handleCopyColor}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
