import { SectionWrapper } from "../atom/SectionWrapper";
import { MemoryBoard } from "./MemoryBoard";
import { MemoryReset } from "./MemoryReset";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <MemoryProvider>
        <div className="flex flex-col items-center gap-14">
          <div className="flex flex-col items-center gap-2">
            <MemoryBoard />

            <MemoryReset className="absolute" defaultFixed="true" />
          </div>
        </div>
      </MemoryProvider>
    </SectionWrapper>
  );
};
