import { Button } from "@/components/atom/Button";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { PlaceCreat } from "./PlaceCreat";
import { Menu, Mode } from "../types";
import { useRoomStore } from "@/lib/stores/room";

const PlaceRoomWP = withMousePosition(PlaceCreat);

interface PlaceMenuProps {
  className: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const PlaceMenu: React.FC<PlaceMenuProps> = ({
  className,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode } = useRoomStore();

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          className={className}
          onClick={() => {
            setActiveMenu(Menu.place);
            setMode(Mode.create);
          }}
          selected={activeMenu === Menu.place}
          disabled={disabled}
        >
          Rooms & Places
        </Button>
      </div>

      {activeMenu === Menu.place && (
        <PlaceRoomWP
          onClose={() => setActiveMenu(null)}
          handleClose={() => setActiveMenu(null)}
          className="absolute z-30 translate-y-24 w-fit"
          withToggleLock={false}
          withTitleBar={true}
          titleText="Rooms & Places"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
