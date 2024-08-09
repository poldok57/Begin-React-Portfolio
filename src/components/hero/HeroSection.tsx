import { default as NextImage } from "next/image";
import { useEffect, useState, useRef, LegacyRef } from "react";

import { FULL_NAME } from "../../lib/config";
import { withMousePosition } from "../windows/withMousePosition";
import { useComponentSize } from "../windows/WithResizing";

const HeroLogo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { componentSize } = useComponentSize();
  const [size, setSize] = useState({ width: 300, height: 300 });
  const canResizeRef = useRef(false);

  const [imageLoaded, setImageLoaded] = useState(false);
  const strImage = "/images/alinenkarl-300.png";

  useEffect(() => {
    const img = new Image();
    img.src = strImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (!imageLoaded || !ref.current) {
      return;
    }
    if (canResizeRef.current) {
      // console.log("onResize", componentSize);
      setSize({
        width: Math.max(componentSize.width ?? 10, 30),
        height: Math.max(componentSize.height ?? 10, 30),
      });
    }

    const canResize = () => {
      canResizeRef.current = true;
    };
    const canNotResize = () => {
      canResizeRef.current = false;
    };

    if (ref.current) {
      ref.current.addEventListener("mousedown", canResize);
      ref.current.addEventListener("mousemove", canResize);
      document.addEventListener("mouseup", canNotResize);
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener("mousedown", canResize);
        ref.current.removeEventListener("mousemove", canResize);
      }
      document.removeEventListener("mouseup", canNotResize);
    };
  }, [componentSize, imageLoaded]);

  return (
    <NextImage
      ref={ref as LegacyRef<HTMLImageElement>}
      width={Math.max(size.width, 100)}
      height={Math.max(size.height, 100)}
      src={strImage}
      alt="avatar"
      className="rounded-full shadow-lg"
    />
  );
};

const HeroPresentation = () => {
  return (
    <div className="flex flex-col gap-4 md:mr-16">
      <h1 className="whitespace-nowrap text-5xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] md:text-7xl">
        We are{" "}
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
          {FULL_NAME}
        </span>
      </h1>
      <p className="max-w-xl text-xl drop-shadow-[0_20px_20px_rgba(0,0,200,0.8)]">
        <b>React Factory.</b> Just try to have Fun, with React toolkit
        development.
      </p>
    </div>
  );
};

const HeroLogoWP = withMousePosition(HeroLogo);
const HeroPresentationWP = withMousePosition(HeroPresentation);

export const HeroSection = () => {
  return (
    <div className="flex relative flex-col m-auto w-full max-w-4xl">
      <HeroLogoWP
        className="top-0 right-0 h-fit md:absolute"
        resizable={true}
        draggable={true}
      />
      <HeroPresentationWP
        trace={false}
        draggable={false}
        className="md:relative"
        titleBar={true}
        title="Welcome to the React Factory !"
      />
    </div>
  );
};
