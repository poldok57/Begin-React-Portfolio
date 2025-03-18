import { DrawList } from "@/components/draw/DrawList";

import { useRoomStore } from "@/lib/stores/room";
import { useZustandDesignStore } from "@/lib/stores/design";
import {
  designFieldsetVariants,
  designLabelVariants,
  menuRoomVariants,
} from "@/styles/menu-variants";

export const RoomDesignList = () => {
  const { designStoreName } = useRoomStore();
  const { getDesignElementLength } =
    useZustandDesignStore(designStoreName).getState();

  return (
    <div className={menuRoomVariants({ width: 64 })}>
      <fieldset
        className={designFieldsetVariants({
          gap: "2",
          className: "border-accent",
        })}
      >
        <legend className={designLabelVariants({ bold: true })}>
          Design elements ({getDesignElementLength()})
        </legend>
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
