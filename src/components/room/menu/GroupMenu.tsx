import { Button } from "@/components/atom/Button";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { GroupCreat } from "./GroupCreat";
import { Menu, Mode } from "../types";
import { useRoomStore } from "@/lib/stores/room";

const GroupCreatWP = withMousePosition(GroupCreat);

interface GroupMenuProps {
  className: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const GroupMenu: React.FC<GroupMenuProps> = ({
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
            setActiveMenu(Menu.groupCreat);
            setMode(Mode.create);
          }}
          selected={activeMenu === Menu.groupCreat}
          disabled={disabled}
        >
          Group & Tournament
        </Button>
      </div>

      {activeMenu === Menu.groupCreat && (
        <GroupCreatWP
          // setActiveMenu={setActiveMenu}
          onClose={() => setActiveMenu(null)}
          className="absolute z-30 translate-y-24 w-fit"
          withToggleLock={false}
          withTitleBar={true}
          titleText="Group & Tournament"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
