"use client";
import { FULL_NAME } from "../../lib/config";
import { withMousePosition } from "../windows/withMousePosition";
import { ImageResizable } from "../windows/ImageResizable";

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

const HeroPresentationWP = withMousePosition(HeroPresentation);

export const HeroSection = () => {
  return (
    <div className="flex relative flex-col m-auto w-full max-w-4xl">
      <ImageResizable
        className="top-0 right-0 h-fit md:absolute"
        withToggleLock={true}
        resizable={true}
        draggable={false}
        minWidth={120}
        minHeight={120}
        width={300}
        height={300}
        src="/images/alinenkarl-300.png"
        alt="avatar"
      />
      <HeroPresentationWP
        trace={false}
        draggable={false}
        className="md:relative"
        withTitleBar={true}
        titleText="Welcome to the React Factory !"
      />
    </div>
  );
};
