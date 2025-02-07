import React, { createContext, useRef, useContext, useState } from "react";
import {
  AllParams,
  DEFAULT_PARAMS,
  DRAWING_MODES,
  GroupParams,
  EventModeAction,
  Params,
} from "@/lib/canvas/canvas-defines";
import { Coordinate } from "@/lib/canvas/types";

interface DrawingContextProps {
  drawingParams: AllParams;
  addEventDetail: (detail: EventModeAction) => void;
  addEventAction: (action: string) => void;
  handleChangeParams: (newParams: GroupParams) => void;
  handleChangeMode: (newMode: string, position?: Coordinate) => void;
  handleImage: (mode: string) => void;
  setDrawingParams: (params: Partial<AllParams>) => void;
  getDrawingParams: () => AllParams;
  setGeneralParams: (param: Params) => void;

  setPathParams: (param: Params) => void;
  setTextParams: (param: Params) => void;
  setArrowParams: (param: Params) => void;
  setShapeParams: (param: Params) => void;
  setBorderParams: (param: Params) => void;
  setDrawingMode: (mode: string) => void;
  mode: string;
  setLockRatio: (ratio: boolean) => void;
  handleSelectZone: () => void;
  reloadControl: number;
  needReloadControl: () => void;
  needRefresh: () => void;
}

const DrawingContext = createContext<DrawingContextProps | undefined>(
  undefined
);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setDrawingModeState] = useState(DRAWING_MODES.INIT);
  const [, setToRefresh] = useState(0);

  const drawingParamsRef = useRef<AllParams>(DEFAULT_PARAMS);

  // const [withText, setWithText] = useState(false);

  const needRefresh = () => {
    setToRefresh((current) => current + 1);
  };

  const setDrawingParams = (params: Partial<AllParams>) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...params };
  };

  const addEventDetail = (detail: EventModeAction) => {
    const event = new CustomEvent("modeChanged", { detail });
    document.dispatchEvent(event);
  };

  const addEventAction = (action: string) => {
    addEventDetail({ mode: DRAWING_MODES.ACTION, action });
  };

  const handleChangeParams = (newParams: GroupParams) => {
    setDrawingParams(newParams);
    addEventDetail({ mode: DRAWING_MODES.CHANGE });
  };

  const handleImage = (mode: string) => {
    setDrawingMode(DRAWING_MODES.IMAGE);
    addEventAction(mode);
  };

  const handleChangeMode = (
    newMode: string,
    position?: { x: number; y: number }
  ) => {
    setDrawingMode(newMode);
    if (position) {
      setTimeout(() => {
        addEventDetail({
          mode: DRAWING_MODES.ACTION,
          action: DRAWING_MODES.POSITION,
          position,
        });
      }, 50);
    }
  };

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingMode = (mode: string) => {
    setDrawingParams({ mode });
    setDrawingModeState(mode);
  };

  const setGeneralParams = (param: Params) => {
    const paramsGeneral = { ...drawingParamsRef.current.general, ...param };
    handleChangeParams({ general: paramsGeneral });
  };

  const setPathParams = (param: Params) => {
    const paramsPath = { ...drawingParamsRef.current.path, ...param };
    handleChangeParams({ path: paramsPath });
  };

  const setShapeParams = (param: Params) => {
    const paramsShape = { ...drawingParamsRef.current.shape, ...param };
    handleChangeParams({ shape: paramsShape });
  };

  const setBorderParams = (param: Params) => {
    const paramsBorder = { ...drawingParamsRef.current.border, ...param };
    handleChangeParams({ border: paramsBorder });
  };

  const setTextParams = (param: Params) => {
    const paramsText = { ...drawingParamsRef.current.text, ...param };
    handleChangeParams({ text: paramsText });
  };

  const setArrowParams = (param: Params) => {
    const paramsArrow = { ...drawingParamsRef.current.arrow, ...param };
    handleChangeParams({ arrow: paramsArrow });
  };

  const setLockRatio = (ratio: boolean) => {
    setDrawingParams({ lockRatio: ratio });
    addEventDetail({ mode: DRAWING_MODES.CHANGE });
  };

  const handleSelectZone = () => {
    if (mode !== DRAWING_MODES.SELECT) {
      // active selection mode
      handleChangeMode(DRAWING_MODES.SELECT);
      setLockRatio(false);
      return;
    }
    // reselect zone
    addEventAction(DRAWING_MODES.SELECT_AREA);
  };

  const [reloadControl, setReloadControl] = useState(0);

  const needReloadControl = () => {
    setReloadControl((current) => current + 1);
  };

  return (
    <DrawingContext.Provider
      value={{
        drawingParams: drawingParamsRef.current,
        addEventDetail,
        addEventAction,
        handleChangeParams,
        handleImage,
        handleChangeMode,
        setDrawingParams,
        getDrawingParams,
        setGeneralParams,
        setPathParams,
        setArrowParams,

        setShapeParams,
        setBorderParams,
        setTextParams,
        setDrawingMode,
        mode,
        setLockRatio,
        handleSelectZone,
        reloadControl,
        needReloadControl,
        needRefresh,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawingContext = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error("useDrawingContext must be used within a DrawingProvider");
  }
  return context;
};
