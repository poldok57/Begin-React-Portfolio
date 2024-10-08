import React from "react";
import { SectionWrapper } from "@/components/atom/SectionWrapper";
import { CenteredLoader } from "@/components/atom/Loader/Loader";
import { ButtonOpenFullScreen } from "../windows/ButtonOpenFullScreen";
import dynamic from "next/dynamic";
const DynamicDrawSection = dynamic(() => import("../draw"), {
  loading: () => <CenteredLoader />,
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
