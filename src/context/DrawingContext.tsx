import React, { createContext, useRef, useContext, useState } from "react";
import {
  AllParams,
  DEFAULT_PARAMS,
  DRAWING_MODES,
  GroupParams,
  EventModeAction,
  Params,
} from "@/lib/canvas/canvas-defines";

interface DrawingContextProps {
  drawingParams: AllParams;
  addEventDetail: (detail: EventModeAction) => void;
  addEventAction: (action: string) => void;
  addEventMode: (mode: string) => void;
  handleChangeParams: (newParams: GroupParams) => void;
  handleChangeMode: (newMode: string) => void;
  handleOpacity: (value: number) => void;
  setDrawingParams: (params: Partial<AllParams>) => void;
  getDrawingParams: () => AllParams;
  setGeneralParams: (param: Params) => void;
  setPathParams: (param: Params) => void;
  setTextParams: (param: Params) => void;
  setArrowParams: (param: Params) => void;
  setShapeParams: (param: Params) => void;
  setBorderParams: (param: Params) => void;
  setLockRatio: (ratio: boolean) => void;
  setMode: (mode: string) => void;
  mode: string;
  isFilled: () => boolean;
  setFilled: (filled: boolean) => void;
  withText: boolean;
  setWithText: (withText: boolean) => void;
  lockRatio: boolean;
  setGeneralColor: (color: string) => void;
  getGeneralColor: () => string;
}

const DrawingContext = createContext<DrawingContextProps | undefined>(
  undefined
);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState(DRAWING_MODES.INIT);

  const drawingParamsRef = useRef<AllParams>(DEFAULT_PARAMS);

  const [filled, setFilled] = useState(
    drawingParamsRef.current.general.filled ?? false
  );
  const isFilled = () => {
    return filled;
  };

  const [withText, setWithText] = useState(false);

  const [lockRatio, setLockRatioState] = useState(
    drawingParamsRef.current.lockRatio
  );

  // const memoGenralColorRef = useRef(drawingParamsRef.current.general.color);
  const setGeneralColor = (color: string) => {
    drawingParamsRef.current.general.color = color;
    // memoGenralColorRef.current = color;
  };
  const getGeneralColor = () => {
    return drawingParamsRef.current.general.color;
    // return memoGenralColorRef.current;
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
  const addEventMode = (mode: string) => {
    addEventDetail({ mode });
  };

  const handleChangeParams = (newParams: GroupParams) => {
    setDrawingParams(newParams);
    addEventDetail({ mode: DRAWING_MODES.CHANGE });
  };
  const handleOpacity = (value: number) => {
    drawingParamsRef.current.general.opacity = value / 100;
    handleChangeParams({ general: drawingParamsRef.current.general });
  };

  const handleChangeMode = (newMode: string) => {
    setMode(newMode);
    addEventMode(newMode);
    // mode = newMode;
  };

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setMode = (mode: string) => {
    setDrawingParams({ mode });
    setModeState(mode);
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
    // alertMessage("Locked ratio : " + (ratio ? "ON" : "off"));
    setDrawingParams({ lockRatio: ratio });
    setLockRatioState(ratio);
    addEventMode(DRAWING_MODES.CHANGE);
  };

  return (
    <DrawingContext.Provider
      value={{
        drawingParams: drawingParamsRef.current,
        addEventDetail,
        addEventAction,
        addEventMode,
        handleChangeParams,
        handleChangeMode,
        handleOpacity,
        setDrawingParams,
        getDrawingParams,
        setGeneralParams,
        setPathParams,
        setArrowParams,
        setShapeParams,
        setBorderParams,
        setTextParams,
        setMode,
        mode,
        isFilled,
        setFilled,
        withText,
        setWithText,
        lockRatio,
        setLockRatio,
        setGeneralColor,
        getGeneralColor,
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
