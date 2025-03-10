import React, { useState, useRef } from "react";
import { useCanvas } from "./hooks/useCanvas";
import { withMousePosition } from "../windows/withMousePosition";
import { DrawList } from "./DrawList";
import { useZustandDesignStore } from "@/lib/stores/design";
import { ColorPikerBg } from "@/components/colors/ColorPikerBg";

interface CanvasProps {
  width: number;
  height: number;
  storeName?: string | null;
}

const DrawListWP = withMousePosition(DrawList);

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  storeName = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showColorPicker, setShowColorPicker] = useState(false);

  const store = useZustandDesignStore(storeName);

  let scale = 1;
  let setScale = null;
  let setSelectedDesignElement = null;
  let backgroundColor = "#eeeeee";
  let setBackgroundColor = null;

  if (store) {
    ({
      scale,
      setScale,
      setSelectedDesignElement,
      backgroundColor,
      setBackgroundColor,
    } = store.getState());
  }

  const [background, setBackground] = useState(backgroundColor);
  const [refresh, setRefresh] = useState(0);

  const { simpleRefreshCanvas } = useCanvas({
    canvasRef,
    storeName,
    scale,
  });

  const onCloseColorPicker = () => {
    setShowColorPicker(false);
    if (setBackgroundColor) {
      setBackgroundColor(background);
    }
  };

  const changeScale = async (scale: number) => {
    if (setScale) {
      setScale(scale);
    }
    setRefresh(refresh + 1);
    if (setSelectedDesignElement) {
      setSelectedDesignElement(null);
    }

    await simpleRefreshCanvas(false, scale);
  };

  return (
    <>
      <div className="flex flex-row gap-1">
        <div
          className="flex flex-col justify-between -translate-x-48"
          style={{
            height: Math.max(height, 280),
          }}
        >
          {/* Scale Control */}
          <div className="flex flex-col gap-1 items-center p-2 w-36 h-14 rounded-lg border border-gray-400 shadow-md origin-top-right -rotate-90">
            <div className="flex gap-2 items-center">
              <label htmlFor="scale-range" className="text-sm text-gray-500">
                Scale
              </label>
              <span className="text-xs text-gray-500">{scale}</span>
            </div>
            <input
              id="scale-range"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => changeScale(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
          {/* Background Control */}
          <div className="flex flex-col gap-1 justify-center items-center w-36 h-14 rounded-lg border border-gray-400 shadow-md origin-top-right -rotate-90 -translate-y-20">
            <div className="flex gap-2">
              <label
                htmlFor="background-range"
                className="text-sm text-gray-500"
              >
                Background
              </label>
              <div
                className="w-8 h-6 border border-gray-400 cursor-pointer hover:border-gray-500"
                style={{ backgroundColor: background }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            height: height + 5,
            width: width + 5,
            backgroundColor: background,
          }}
          className="border-2 border-blue-300 -translate-x-32 border-spacing-2"
        >
          <canvas
            width={width}
            height={height}
            ref={canvasRef}
            className="m-auto rounded-md shadow-md border-spacing-3"
          />
        </div>
      </div>

      <DrawListWP
        storeName={storeName}
        withMinimize={true}
        style={{
          top: "120px",
          right: "40px",
          position: "fixed",
          zIndex: 5,
        }}
        withTitleBar={true}
        titleText="Design elements"
        titleHidden={false}
        draggable={false}
      />

      {showColorPicker && (
        <ColorPikerBg
          className="z-10 p-3 rounded-lg border border-gray-400 shadow-xl bg-base-100"
          style={{
            position: "absolute",
            left: `25px`,
            bottom: `65px`,
          }}
          title="Background Color"
          closeColorPicker={onCloseColorPicker}
          color={background}
          setColor={setBackground}
        />
      )}
    </>
  );
};
