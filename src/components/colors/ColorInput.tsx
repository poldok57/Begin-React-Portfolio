import React, { useRef } from "react";
import { Copy, Undo2 } from "lucide-react";
import { getContrastColor } from "./colors";

interface ColorInputProps {
  color: string;
  onChange: (value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ color, onChange }) => {
  const handleCopyColor = () => {
    navigator.clipboard.writeText(color);
  };
  const memoColorRef = useRef(color);

  return (
    <div className="flex relative gap-x-1 justify-center items-center bg-base-100">
      <button
        className="btn btn-sm"
        onClick={() => onChange(memoColorRef.current)}
        title="Back to initial color"
        style={{ backgroundColor: memoColorRef.current }}
      >
        <Undo2 size={14} color={getContrastColor(memoColorRef.current)} />
      </button>
      <input
        type="text"
        className="p-1 py-2 m-1 w-11/12 rounded-md border border-gray-300 bg-base-100 focus:border-gray-800"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="absolute right-2 btn btn-sm"
        onClick={handleCopyColor}
        title="Copy to clipboard"
      >
        <Copy size={14} />
      </button>
    </div>
  );
};
