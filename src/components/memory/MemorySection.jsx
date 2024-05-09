import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryControlWP } from "./MemoryControl";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <MemoryProvider>
      <div className="relative flex h-fit w-full flex-col items-start justify-around gap-4 border-dashed border-gray-800 lg:flex-row">
        <MemoryBoardWP
          className="absolute left-10 flex w-fit flex-col items-center gap-2 rounded-md border-2 border-secondary bg-background p-2 shadow-lg"
          titleBar="false"
          titleClassName="bg-black text-white border-2 rounded border-primary"
          locked="true"
        />

        <MemoryControlWP
          className="absolute right-10 top-10 bg-background"
          trace={false}
          close="false"
          titleBar="true"
          titleHidden="false"
          title="Reset panel"
          titleHeight={36}
          locked="true"
        />
      </div>
    </MemoryProvider>
  );
};
