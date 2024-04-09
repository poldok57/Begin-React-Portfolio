import { FULL_NAME } from "../../lib/config";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import { withMousePosition } from "../../context/withMousePosition";

const HeroLogo = () => {
  return (
    <img
      width={300}
      height={300}
      src="/images/alinenkarl-300.png"
      alt="avatar"
      className="rounded-full shadow-lg"
    />
  );
};

const HeroPresentation = () => {
  return (
    <div className="flex flex-col gap-4 md:mr-16">
      <h1 className="drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] whitespace-nowrap text-5xl md:text-7xl">
        We are{" "}
        <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text font-extrabold text-transparent">
          {FULL_NAME}
        </span>
      </h1>
      <p className="drop-shadow-[0_20px_20px_rgba(0,0,200,0.8)] max-w-xl text-xl">
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
    <HightLightOnRender className="relative m-auto flex w-full max-w-4xl flex-col">
      <HeroLogoWP className="top-0 right-0 md:absolute" />
      <HeroPresentationWP
        trace="false"
        className="md:relative"
        titleBar="true"
        title="Welcome to the React Factory !"
      />
    </HightLightOnRender>
  );
};
