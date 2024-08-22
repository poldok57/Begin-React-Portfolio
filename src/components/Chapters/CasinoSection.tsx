import React from "react";
import { SectionWrapper } from "@/components/atom/SectionWrapper";
import { CenteredLoader } from "@/components/atom/Loader/Loader";
import { ButtonOpenFullScreen } from "../windows/ButtonOpenFullScreen";
import dynamic from "next/dynamic";
const RoomCreat = dynamic(() => import("../room"), {
  loading: () => <CenteredLoader />,
  ssr: false,
});

export const CasinoSection = () => {
  return (
    <SectionWrapper title="Faites vos jeux !">
      <ButtonOpenFullScreen
        className="w-28 h-32 text-lg bg-amber-500 text-slate-900 hover:bg-amber-400 active:bg-amber-300"
        value="Room"
        title="Rooms manager"
        titleBackground="#d97706"
      >
        <RoomCreat />
      </ButtonOpenFullScreen>
    </SectionWrapper>
  );
};
