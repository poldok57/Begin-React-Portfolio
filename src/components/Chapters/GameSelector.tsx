import dynamic from "next/dynamic";
import { SectionWrapper } from "@/components/atom/SectionWrapper";
import { CenteredLoader } from "@/components/atom/Loader/Loader";
import { ButtonOpenFullScreen } from "@/components/windows/ButtonOpenFullScreen";

// dynamic import Memory Section
const DynamicMemorySection = dynamic(() => import("../memory"), {
  loading: () => <CenteredLoader />,
  ssr: false,
});

export const GameSelector = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <ButtonOpenFullScreen
        className="w-28 h-32 text-lg"
        value="Memory"
        title="Test your memory"
        // titleBackground="#44ee99"
      >
        <DynamicMemorySection />
      </ButtonOpenFullScreen>
    </SectionWrapper>
  );
};
