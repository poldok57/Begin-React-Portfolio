import { SectionWrapper } from "../atom/SectionWrapper";
import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryResetWP } from "./MemoryReset";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <MemoryProvider>
        <div className="relative flex min-h-screen w-full flex-col gap-4 border-dashed border-gray-800">
          <MemoryBoardWP
            className="relative flex flex-col items-center gap-2 rounded-md border-2 border-secondary bg-background p-2 shadow-lg lg:absolute lg:left-1"
            title="Test your memory"
            titleBar="true"
            titleHidden="true"
            titleClassName="bg-black text-white border-2 rounded border-primary"
            locked="true"
          />

          <MemoryResetWP
            className="relative bg-background lg:absolute lg:top-12 lg:right-5"
            trace="false"
            close="false"
            titleBar="true"
            titleHidden="false"
            title="Reset panel"
            titleHeight={30}
          />
        </div>
      </MemoryProvider>
    </SectionWrapper>
  );
};
