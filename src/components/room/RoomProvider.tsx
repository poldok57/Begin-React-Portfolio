import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

interface ScaleContextProps {
  scale: number;
  setScale: (scale: number) => void;
  getScale: () => number;
}

const RoomContext = createContext<ScaleContextProps | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setStarteScale] = useState<number>(1);

  const scaleRef = useRef<number>(1);
  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    setStarteScale(newScale);
  }, []);

  const getScale = useCallback(() => {
    return scaleRef.current;
  }, []);

  return (
    <RoomContext.Provider value={{ scale: scale, setScale, getScale }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useScale = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useScale must be used within a RoomProvider");
  }
  return context;
};
