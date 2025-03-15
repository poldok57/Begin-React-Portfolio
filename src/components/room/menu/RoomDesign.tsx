import React, { useState } from "react";
import { Button } from "@/components/atom/Button";

// import { getContrastColor } from "../colors/colors";
import { useRoomStore } from "@/lib/stores/room";
import { Mode, Menu } from "../types";
import { withMousePosition } from "../../windows/withMousePosition";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";
import { useDrawingContext } from "@/context/DrawingContext";
import { RoomDesignList } from "./RoomDesignList";
import { RoomDesignMenu } from "./RoomDesignMenu";
import { menuRoomContainer } from "@/styles/menu-variants";

const RoomDesignMenuWP = withMousePosition(RoomDesignMenu);
const RoomDesignListWP = withMousePosition(RoomDesignList);
interface RoomDesignProps {
  className: string;
  btnSize?: number;
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
  buttonIconSize?: number;
  buttonShapeSize?: number;
}

export const RoomDesign: React.FC<RoomDesignProps> = ({
  className,
  isTouch,
  activeMenu,
  setActiveMenu,
  disabled = false,
  buttonIconSize = 20,
  buttonShapeSize = 16,
}) => {
  const { setMode, defaultMode } = useRoomStore();
  const { handleChangeMode } = useDrawingContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleOpen = () => {
    setActiveMenu(Menu.roomDesign);
    setIsOpen(true);
    setMode(Mode.draw);
  };

  const handleClose = () => {
    setActiveMenu(null);
    handleChangeMode(DRAWING_MODES.PAUSE);
    setIsOpen(false);
    setMode(defaultMode);
  };

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          onClick={() => handleOpen()}
          className={className}
          disabled={disabled}
          selected={activeMenu === Menu.roomDesign}
          title="Room design"
        >
          Room design
        </Button>
      </div>
      {activeMenu === Menu.roomDesign && isOpen && (
        <>
          <RoomDesignMenuWP
            isTouch={isTouch}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            className={menuRoomContainer()}
            onClose={handleClose}
            withToggleLock={false}
            withTitleBar={true}
            titleText="Room design"
            titleHidden={false}
            titleBackground={"#ae00ff"}
            draggable={true}
            buttonIconSize={buttonIconSize}
            buttonShapeSize={buttonShapeSize}
            showList={showList}
            setShowList={setShowList}
          />
          {showList && (
            <RoomDesignListWP
              className={menuRoomContainer({ alignement: "right" })}
              withToggleLock={false}
              withTitleBar={true}
              titleText="Design elements"
              titleHidden={false}
              titleBackground={"#ae00ff"}
              onClose={() => setShowList(false)}
            />
          )}
        </>
      )}
    </>
  );
};
