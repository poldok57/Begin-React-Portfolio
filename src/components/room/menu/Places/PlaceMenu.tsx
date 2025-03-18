import { Button } from "@/components/atom/Button";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { PlaceCreat } from "./PlaceCreat";
import { Menu } from "../../types";
import { useRoomStore } from "@/lib/stores/room";
import { menuRoomContainer } from "@/styles/menu-variants";
import { useEffect, useRef, useState, useCallback } from "react";
import { useZustandTableStore } from "@/lib/stores/tables";
import { usePlaceStore } from "@/lib/stores/places";

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
  const { setMode, defaultMode, tablesStoreName } = useRoomStore();
  // Reference to track if the AddTables menu has been opened automatically
  const hasAutoOpenedAddTablesRef = useRef(false);
  // Reference to track the last processed storeName
  const lastStoreNameRef = useRef<string | null>(null);
  // Get the current table store
  const tableStore = useZustandTableStore(tablesStoreName);
  // Track if this is the initial render
  const isInitialRender = useRef(true);
  // Track if a place was explicitly selected by the user
  const [wasPlaceExplicitlySelected, setWasPlaceExplicitlySelected] =
    useState(false);

  const { getCurrentPlaceId } = usePlaceStore();
  const currentPlaceId = getCurrentPlaceId();

  // Callback function for when a place is selected from PlaceCreat
  const handlePlaceSelected = useCallback(() => {
    setWasPlaceExplicitlySelected(true);
    // Reset the auto-open flag when a new place is selected
    hasAutoOpenedAddTablesRef.current = false;
  }, []);

  // Effect to track when a place is explicitly selected by the user
  useEffect(() => {
    if (!isInitialRender.current && currentPlaceId) {
      // We don't set wasPlaceExplicitlySelected here anymore
      // This will be handled by the handlePlaceSelected callback
    }

    // After the first render, mark initial render as complete
    isInitialRender.current = false;
  }, [currentPlaceId]);

  useEffect(() => {
    // If the storeName has changed and is not null
    if (
      tablesStoreName !== lastStoreNameRef.current &&
      tablesStoreName !== null
    ) {
      // Update the reference to the last storeName
      lastStoreNameRef.current = tablesStoreName;

      // Check if the selected room contains no tables
      const tables = tableStore.getState().tables;

      // Only open the AddTables menu if:
      // 1. There are no tables
      // 2. We haven't already auto-opened it
      // 3. The AddTable menu is not already open
      // 4. The component is mounted in the DOM
      // 5. This is not the initial application load
      // 6. A place was explicitly selected by the user
      if (
        tables.length === 0 &&
        !hasAutoOpenedAddTablesRef.current &&
        activeMenu !== Menu.addTable &&
        !isInitialRender.current &&
        wasPlaceExplicitlySelected
      ) {
        // console.log("Opening AddTables menu - no tables found");
        // Automatically open the AddTables menu
        setActiveMenu(Menu.addTable);
        setMode(defaultMode);
        // Mark that the menu has been opened automatically
        hasAutoOpenedAddTablesRef.current = true;
        // Reset the explicit selection flag after using it
        setWasPlaceExplicitlySelected(false);
      }
    }
  }, [
    tablesStoreName,
    tableStore,
    setActiveMenu,
    setMode,
    defaultMode,
    activeMenu,
    wasPlaceExplicitlySelected,
  ]);

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          className={className}
          onClick={() => {
            setActiveMenu(Menu.place);
            setMode(defaultMode);
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
          onPlaceSelected={handlePlaceSelected}
          className={menuRoomContainer({ className: "fit" })}
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
