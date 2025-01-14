import { LinePath, LineType } from "./types";
import {
  DRAW_TYPE,
  CanvasPointsData,
  ShapeDefinition,
  GroupParams,
  ParamsGeneral,
  ThingsToDraw,
  ParamsArrow,
} from "./canvas-defines";

export const updateParamFromElement = (
  setParams: (params: GroupParams) => void,
  getSelectedElement: () => ThingsToDraw | null
): string | null => {
  const selectedElement: CanvasPointsData | ShapeDefinition | null | undefined =
    getSelectedElement();

  if (!selectedElement) {
    console.log("update ParamFromElement", "NO selectedElement");
    return null;
  }

  // console.log("update ParamFromElement", selectedElement);

  const general: ParamsGeneral = selectedElement.general ?? {
    lineWidth: 0,
    color: "",
    opacity: 1,
    filled: false,
  };

  switch (selectedElement.type) {
    case DRAW_TYPE.DRAW:
      break;
    case DRAW_TYPE.LINES_PATH:
    case DRAW_TYPE.ARROW:
      if (selectedElement.path) {
        setParams({ path: selectedElement.path });
      }
      if (
        "items" in selectedElement &&
        Array.isArray(selectedElement.items) &&
        selectedElement.items.length > 1
      ) {
        const line: LinePath = selectedElement.items[1] as LinePath;
        if (line.strokeStyle) {
          general.color = line.strokeStyle;
        }
        if (line.lineWidth) {
          general.lineWidth = line.lineWidth;
        }
        if (line.globalAlpha) {
          general.opacity = line.globalAlpha;
        }
        setParams({ general: general });

        if (line.type === LineType.ARROW) {
          const arrow = {
            headSize: line.headSize,
            padding: line.padding,
            curvature: line.curvature,
          } as ParamsArrow;
          // console.log("arrow setParams", arrow);
          setParams({ arrow: arrow });
        }
      }
      break;
    case DRAW_TYPE.TEXT:
      if (selectedElement.text) {
        setParams({ text: selectedElement.text });
      }
      break;
    default: // Shape & Image
      if (selectedElement.shape) {
        setParams({ shape: selectedElement.shape });
      }
      if (selectedElement.shape?.withText && selectedElement.text) {
        setParams({ text: selectedElement.text });
      }
      if (selectedElement.shape?.withBorder && selectedElement.border) {
        setParams({ border: selectedElement.border });
      }
  }
  if (selectedElement.type !== DRAW_TYPE.TEXT) {
    setParams({ general: selectedElement.general });
  }
  // console.log("selectedElement.type", selectedElement.type);
  setParams({ mode: selectedElement.type });
  setParams({
    lockRatio: selectedElement.type === DRAW_TYPE.IMAGE ? true : false,
  });
  return selectedElement.type;
};
