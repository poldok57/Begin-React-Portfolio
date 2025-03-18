import { Button } from "@/components/atom/Button";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { GroupSelection } from "./GroupSelection";
import { Menu, Mode } from "../../types";
import { useRoomStore } from "@/lib/stores/room";
import { menuRoomContainer } from "@/styles/menu-variants";

const GroupSelectionWP = withMousePosition(GroupSelection);

interface GroupCreatProps {
  className: string;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const GroupCreat: React.FC<GroupCreatProps> = ({
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
            setMode(Mode.settings);
          }}
          selected={activeMenu === Menu.groupCreat}
          disabled={disabled}
        >
          Group & Tournament
        </Button>
      </div>

      {activeMenu === Menu.groupCreat && (
        <GroupSelectionWP
          // setActiveMenu={setActiveMenu}
          onClose={() => {
            setActiveMenu(null);
            setMode(Mode.create);
          }}
          className={menuRoomContainer({ className: "fit" })}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Group & Tournament"
          titleHidden={false}
          titleBackground={"#ff5a1E"}
          draggable={true}
        />
      )}
    </>
  );
};
