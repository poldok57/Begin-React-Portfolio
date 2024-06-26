import dynamic from "next/dynamic";
import { SectionWrapper } from "../atom/SectionWrapper";
import { ButtonOpenModal } from "../atom/ButtonOpenModal";

// dynamic import Memory Section
const DynamicMemorySection = dynamic(() => import("../memory"), {
  ssr: false,
});

export const GameSelector = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <ButtonOpenModal
        className="h-24 text-lg"
        value="Memory"
        title="Test your memory"
      >
        <DynamicMemorySection />
      </ButtonOpenModal>
    </SectionWrapper>
  );
};
