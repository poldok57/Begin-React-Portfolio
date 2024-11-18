import { LinePath } from "./types";
import {
  DRAW_TYPE,
  CanvasPointsData,
  ShapeDefinition,
  GroupParams,
  ParamsGeneral,
  ThingsToDraw,
} from "./canvas-defines";

export const updateParamFromElement = (
  setParams: (params: GroupParams) => void,
  getSelectedElement: () => ThingsToDraw | null
): string | null => {
  const selectedElement: CanvasPointsData | ShapeDefinition | null | undefined =
    getSelectedElement();

  if (!selectedElement) {
    return null;
  }

  let copyGeneral: boolean = false;

  switch (selectedElement.type) {
    case DRAW_TYPE.DRAW:
      copyGeneral = true;
      break;
    case DRAW_TYPE.LINES_PATH:
      if (selectedElement.path) {
        setParams({ path: selectedElement.path });
      }
      const general: ParamsGeneral = {
        lineWidth: 0,
        color: "",
        opacity: 0,
      };
      if (
        "items" in selectedElement &&
        Array.isArray(selectedElement.items) &&
        selectedElement.items.length > 1
      ) {
        const line: LinePath = selectedElement.items[1] as LinePath;
        general.color = line.strokeStyle || "";
        general.lineWidth = line.lineWidth || 0;
        general.opacity = line.globalAlpha || 0;
      }
      setParams({ general: general });
      break;
    case DRAW_TYPE.TEXT:
      if (selectedElement.text) {
        setParams({ text: selectedElement.text });
      }
      break;
    default:
      copyGeneral = true;
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
  if (copyGeneral) {
    setParams({ general: selectedElement.general });
  }
  // console.log("selectedElement.type", selectedElement.type);
  setParams({ mode: selectedElement.type });
  return selectedElement.type;
};
