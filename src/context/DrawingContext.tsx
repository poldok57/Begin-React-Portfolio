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
  setMode: (mode: string) => void;
  mode: string;
  withText: boolean;
  setWithText: (withText: boolean) => void;
  setLockRatio: (ratio: boolean) => void;
  reloadControl: number;
  setReloadControl: () => void;
  needRefresh: () => void;
}

const DrawingContext = createContext<DrawingContextProps | undefined>(
  undefined
);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState(DRAWING_MODES.INIT);
  const [toRefresh, setToRefresh] = useState(0);

  const drawingParamsRef = useRef<AllParams>(DEFAULT_PARAMS);

  const [withText, setWithText] = useState(false);

  const needRefresh = () => {
    setToRefresh(toRefresh + 1);
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
    setDrawingParams({ lockRatio: ratio });
    addEventMode(DRAWING_MODES.CHANGE);
  };

  const [reloadControl, setReloadControlState] = useState(0);

  const setReloadControl = () => {
    setReloadControlState(reloadControl + 1);
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
        withText,
        setWithText,
        setLockRatio,
        reloadControl,
        setReloadControl,
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
