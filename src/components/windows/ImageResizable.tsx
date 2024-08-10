// import { default as NextImage } from "next/image";
import Image from "next/image";
import { useEffect, useState, useRef, LegacyRef } from "react";

import { useComponentSize } from "./WithResizing";
import { withMousePosition } from "./withMousePosition";
interface ImageResizableProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  withToggleLock?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}
const ImageHandler: React.FC<ImageResizableProps> = ({
  width,
  height,
  minWidth,
  minHeight,
  src = "",
  alt = "",
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { componentSize, setMinimumSize } = useComponentSize();
  const [size, setSize] = useState({
    width: width ?? 120,
    height: height ?? 120,
  });
  const canResizeRef = useRef(false);

  const [imageLoaded, setImageLoaded] = useState(false);

  if (minWidth && minHeight) {
    setMinimumSize({ width: minWidth, height: minHeight });
  }

  // useEffect(() => {
  //   const img = new Image();
  //   img.src = src;
  //   img.onload = () => setImageLoaded(true);
  // }, []);

  const onLoad = () => {
    // console.log("onLoad", ref.current);
    setImageLoaded(true);
  };

  useEffect(() => {
    if (!imageLoaded || !ref.current) {
      return;
    }
    if (canResizeRef.current) {
      // console.log("onResize", componentSize);
      setSize({
        width: Math.max(componentSize.width ?? 10, minWidth ?? 50),
        height: Math.max(componentSize.height ?? 10, minHeight ?? 50),
      });
    }

    const canResize = () => {
      canResizeRef.current = true;
    };
    const canNotResize = () => {
      canResizeRef.current = false;
    };

    if (ref.current && ref.current.parentElement) {
      ref.current.parentElement.addEventListener("mousedown", canResize);
      ref.current.parentElement.addEventListener("mousemove", canResize);
      document.addEventListener("mouseup", canNotResize);
    }
    return () => {
      if (ref.current && ref.current.parentElement) {
        ref.current.parentElement.removeEventListener("mousedown", canResize);
        ref.current.parentElement.removeEventListener("mousemove", canResize);
      }
      document.removeEventListener("mouseup", canNotResize);
    };
  }, [componentSize, imageLoaded]);

  return (
    <>
      <Image
        ref={ref as LegacyRef<HTMLImageElement>}
        width={Math.max(size.width, 100)}
        height={Math.max(size.height, 100)}
        src={src}
        alt={alt}
        onLoad={onLoad}
      />
      {children}
    </>
  );
};

export const ImageResizable = withMousePosition(ImageHandler);
