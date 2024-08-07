import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryControlWP } from "./MemoryControl";
import { MemoryProvider } from "./MemoryProvider";
import { ShowAlertMessagesWP } from "../alert-messages/ShowAlertMessages";

export const MemorySection = () => {
  return (
    <MemoryProvider>
      <div className="flex relative flex-col gap-4 w-full border-gray-800 border-opacity-30 border-dashed lg:flex-row">
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

        <MemoryBoardWP
          id="memory-board"
          className="flex absolute left-10 flex-col gap-2 items-center p-2 rounded-md border-2 shadow-lg w-fit h-fit border-secondary bg-background"
          titleBar={false}
          title="Select a couple of cards"
          titleHeight={30}
          draggable={false}
          resizable={true}
          close={true}
          withMaximize={true}
          trace={false}
        />
      </div>
      <ShowAlertMessagesWP
        display={true}
        close={true}
        draggable={true}
        titleBar={true}
        titleHidden={true}
        withMinimize={true}
        bgTitle="pink"
        title="Alert Message"
        style={{ position: "fixed", right: 20, bottom: 30 }}
      />
    </MemoryProvider>
  );
};
