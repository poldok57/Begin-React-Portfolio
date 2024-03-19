import { SectionWrapper } from "../atom/SectionWrapper";
import { MemoryBoard } from "./MemoryBoard";
import { MemoryResetWP } from "./MemoryReset";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <SectionWrapper title="Are U boring ? Let's play !">
      <MemoryProvider>
        <div className="flex flex-col items-center gap-14">
          <div className="flex flex-col items-center gap-2">
            <MemoryBoard />
          </div>

          <MemoryResetWP
            trace="false"
            close="false"
            titleBar="true"
            titleHide="false"
            title="Reset panel"
            titleHeight={30}
            style={{ position: "relative" }}
          />
        </div>
      </MemoryProvider>
    </SectionWrapper>
  );
};
