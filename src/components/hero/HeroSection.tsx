import { default as NextImage } from "next/image";
import { useEffect, useState, useRef } from "react";

import { FULL_NAME } from "../../lib/config";
import {
  withMousePosition,
  useComponentSize,
} from "../windows/withMousePosition";

const HeroLogo = () => {
  const ref = useRef(null);
  const { componentSize } = useComponentSize();
  const [size, setSize] = useState({ width: 300, height: 300 });

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/alinenkarl-300.png";
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (imageLoaded && ref.current) {
      setSize({
        width: Math.max(componentSize.width ?? 10, 30),
        height: Math.max(componentSize.height ?? 10, 30),
      });
    }
  }, [componentSize, imageLoaded]);

  return (
    <NextImage
      ref={ref}
      width={Math.max(size.width, 30)}
      height={Math.max(size.height, 30)}
      src="/images/alinenkarl-300.png"
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
      <HeroLogoWP className="top-0 right-0 md:absolute" resizable={true} />
      <HeroPresentationWP
        trace={false}
        draggable={false}
        className="md:relative"
        titleBar={true}
        // withMinimize={true}
        title="Welcome to the React Factory !"
      />
    </div>
  );
};
