import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryControlWP } from "./MemoryControl";
import { MemoryProvider } from "./MemoryProvider";

export const MemorySection = () => {
  return (
    <MemoryProvider>
      <div className="flex relative flex-col gap-4 w-full border-gray-800 border-opacity-30 border-dashed lg:flex-row">
        <MemoryBoardWP
          className="flex absolute left-10 flex-col gap-2 items-center p-2 rounded-md border-2 shadow-lg w-fit border-secondary bg-background"
          titleBar={true}
          title="Select a couple of cards"
          draggable={false}
          withMaximize={true}
        />

        <MemoryControlWP
          className="absolute top-10 right-10 bg-background"
          trace={false}
          close={false}
          titleBar={true}
          titleHidden={false}
          title="Reset panel"
          titleHeight={36}
          draggable={false}
        />
      </div>
    </MemoryProvider>
  );
};
