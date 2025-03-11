import { DrawList } from "@/components/draw/DrawList";

import { useRoomStore } from "@/lib/stores/room";
import { useZustandDesignStore } from "@/lib/stores/design";
import { menuRoomVariants } from "@/styles/menu-variants";

export const RoomDesignList = () => {
  const { designStoreName } = useRoomStore();
  const { getDesignElementLength } =
    useZustandDesignStore(designStoreName).getState();

  return (
    <div className={menuRoomVariants({ width: 64 })}>
      <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-accent">
        <legend>Design elements ({getDesignElementLength()})</legend>
        <div className="flex flex-col gap-2 items-center">
          <DrawList
            className="flex flex-col gap-1 px-0 py-2 w-56 text-sm"
            storeName={designStoreName}
          />
        </div>
      </fieldset>
    </div>
  );
};
