import React from "react";
import dynamic from "next/dynamic";
import { SectionWrapper } from "../atom/SectionWrapper";
import { ButtonOpenFullScreen } from "../windows/ButtonOpenFullScreen";
const DynamicDrawSection = dynamic(() => import("../draw"), {
  ssr: false,
});

export const DrawSection = () => {
  return (
    <SectionWrapper title="Dessine-moi un bouton !">
      <ButtonOpenFullScreen
        className="w-28 h-32 text-lg bg-teal-500 hover:bg-teal-400 active:bg-teal-300"
        value="Drawing tool"
        title="Draw me a button"
        titleBackground="#0d9488"
      >
        <DynamicDrawSection />
      </ButtonOpenFullScreen>
    </SectionWrapper>
  );
};
