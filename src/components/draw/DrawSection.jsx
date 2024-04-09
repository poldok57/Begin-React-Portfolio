import { SectionWrapper } from "../atom/SectionWrapper";
import { Draw } from "./Draw";

export const DrawSection = () => {
  return (
    <SectionWrapper title="Dessine-moi un mouton !">
      <Draw />
    </SectionWrapper>
  );
};
