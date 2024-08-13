// import { default as NextImage } from "next/image";
import Image from "next/image";
import { useEffect, useState, useRef, LegacyRef } from "react";

import { useComponentSize } from "./WithResizing";
import { withMousePosition } from "./withMousePosition";
import clsx from "clsx";

interface ImageResizableProps {
  trace?: boolean;
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  fill?: boolean;
  sizes?: string;
  withToggleLock?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  width?: number;
  height?: number;
  keepRatio?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}
const ImageHandler: React.FC<ImageResizableProps> = ({
  trace = false,
  width = 0,
  height = 0,
  fill = true,
  sizes = "33vw",
  src = "",
  alt = "",
  children,
  rounded = "none",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { componentSize, resizeComponent, setRatio } = useComponentSize();
  const [imageLoaded, setImageLoaded] = useState(false);

  console.log("ImageResizable", {
    width,
    height,
  });

  const onLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setImageLoaded(true);
    const originalRatio = img.naturalWidth / img.naturalHeight;
    if (width > 0 && height === 0) {
      height = width / originalRatio;
    } else if (height > 0 && width === 0) {
      width = height * originalRatio;
    } else if (width === 0 && height === 0) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    }
    if (trace)
      console.log(
        `"${src}" loaded width: ${width}, height: ${height} ratio: ${originalRatio}`
      );
    setRatio(originalRatio);

    resizeComponent({
      width,
      height,
    });
  };

  useEffect(() => {
    if (!imageLoaded || !ref.current) {
      return;
    }
  }, [componentSize, imageLoaded]);

  return (
    <>
      <Image
        className={clsx({
          "rounded-lg": rounded === "lg",
          "rounded-md": rounded === "md",
          "rounded-sm": rounded === "sm",
          "rounded-xl": rounded === "xl",
          "rounded-2xl": rounded === "2xl",
          "rounded-3xl": rounded === "3xl",
          "rounded-full": rounded === "full",
        })}
        ref={ref as LegacyRef<HTMLImageElement>}
        // width={Math.max(size.width, 100)}
        // height={Math.max(size.height, 100)}
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        onLoad={onLoad}
      />
      {children}
    </>
  );
};

export const ImageResizable = withMousePosition(ImageHandler);
