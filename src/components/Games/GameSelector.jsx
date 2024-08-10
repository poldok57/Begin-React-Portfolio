import dynamic from "next/dynamic";
import { SectionWrapper } from "../atom/SectionWrapper";
import { ButtonOpenFullScreen } from "../windows/ButtonOpenFullScreen";

// dynamic import Memory Section
const DynamicMemorySection = dynamic(() => import("../memory"), {
  ssr: false,
});

export const GameSelector = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <ButtonOpenFullScreen
        className="w-28 h-32 text-lg"
        value="Memory"
        titleText="Test your memory"
        // titleBackground="#44ee99"
      >
        <DynamicMemorySection />
      </ButtonOpenFullScreen>
    </SectionWrapper>
  );
};
