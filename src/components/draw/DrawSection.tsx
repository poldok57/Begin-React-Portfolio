import React from "react";
import { SectionWrapper } from "../atom/SectionWrapper";
import { Draw } from "./Draw";

export const DrawSection = () => {
  return (
    <SectionWrapper title="Dessine-moi un bouton !">
      <Draw />
    </SectionWrapper>
  );
};
