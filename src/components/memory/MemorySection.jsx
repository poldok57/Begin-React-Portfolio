import { MemoryBoardWP } from "./MemoryBoard";
import { MemoryControlWP } from "./MemoryControl";
import { MemoryProvider } from "./MemoryProvider";
import { ShowAlertMessagesWP } from "../alert-messages/ShowAlertMessages";

export const MemorySection = () => {
  return (
    <MemoryProvider>
      <div className="flex relative flex-col gap-4 w-full border-gray-800 border-opacity-30 border-dashed min-w-fit lg:flex-row">
        <MemoryControlWP
          className="absolute top-10 right-10 bg-background"
          close={false}
          withTitleBar={true}
          titleHidden={false}
          titleText="Reset"
          titleHeight={36}
          draggable={false}
          resizable={true}
          withMinimize={true}
          minWidth={380}
          minHeight={180}
        />

        <MemoryBoardWP
          id="memory-board"
          className="flex absolute left-10 flex-col gap-2 items-center p-2 rounded-md border-2 shadow-lg w-fit h-fit border-secondary bg-background"
          withTitleBar={false}
          titleText="Memory Board"
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
        resizable={true}
        withTitleBar={true}
        titleHidden={true}
        withMinimize={true}
        titleBackground="pink"
        titleText="Game Message"
        style={{ position: "fixed", right: 20, bottom: 30 }}
      />
    </MemoryProvider>
  );
};
