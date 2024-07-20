import { FULL_NAME } from "../../lib/config";
import { withMousePosition } from "../../hooks/withMousePosition";

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
      <h1 className="whitespace-nowrap text-5xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] md:text-7xl">
        We are{" "}
        <span className="font-extrabold text-transparent bg-gradient-to-r from-secondary to-primary bg-clip-text">
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
    <div className="relative flex flex-col w-full max-w-4xl m-auto">
      <HeroLogoWP className="top-0 right-0 md:absolute" />
      <HeroPresentationWP
        trace={true}
        locked={true}
        className="md:relative"
        titleBar={true}
        title="Welcome to the React Factory !"
      />
    </div>
  );
};
