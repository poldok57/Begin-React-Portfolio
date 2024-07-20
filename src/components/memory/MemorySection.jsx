import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryControlWP } from "./MemoryControl";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <MemoryProvider>
      <div className="relative flex flex-col items-start justify-around w-full gap-4 border-gray-800 border-dashed h-fit lg:flex-row">
        <MemoryBoardWP
          className="absolute flex flex-col items-center gap-2 p-2 border-2 rounded-md shadow-lg left-10 w-fit border-secondary bg-background"
          titleBar={false}
          locked={true}
        />

        <MemoryControlWP
          className="absolute right-10 top-10 bg-background"
          trace={false}
          close={false}
          titleBar={true}
          titleHidden={false}
          title="Reset panel"
          titleHeight={36}
          locked={true}
        />
      </div>
    </MemoryProvider>
  );
};
