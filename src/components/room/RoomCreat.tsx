import React, { useEffect, useRef, useState } from "react";
import {
  useZustandTableStore,
  zustandTableStore,
} from "../../lib/stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { addEscapeKeyListener } from "@/lib/utils/keyboard";
import { RoomMenu2 } from "./menu/RoomMenu2";
import { GroundSelection } from "./GroundSelection/GroundSelection";
import { ListTablesPlan } from "./ListTablesPlan";
import { ListTablesText } from "./ListTablesText";
import { ValidationFrame } from "./ValidationFrame";
import { Mode } from "./types";
import { DrawingProvider } from "@/context/DrawingContext";
import { useDrawingContext } from "@/context/DrawingContext";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";
import { TypeListTables } from "./types";
import { useRoomStore } from "@/lib/stores/room";
import { usePlaceStore } from "@/lib/stores/places";
import { PlaceCreat } from "./menu/Places/PlaceCreat";
export const GROUND_ID = "back-ground";

export const getGroundOffset = () => {
  const ground = document.getElementById(GROUND_ID);
  if (ground) {
    const { left, top } = ground.getBoundingClientRect();
    const { scrollLeft, scrollTop } = ground;
    return {
      left: scrollLeft - left,
      top: scrollTop - top,
    };
  }
  return { left: 0, top: 0 };
};

export interface ChangeCoordinatesParams {
  position?: { left?: number; top?: number };
  offset?: { left?: number; top?: number };
  rotation?: number;
  tableIds?: string[] | null;
  uniqueId?: string | null;
}

export const RoomCreatTools = () => {
  const btnSize = isTouchDevice() ? 20 : 16;
  const {
    mode,
    setMode,
    setDefaultMode,
    tablesStoreName,
    addSelectedTableId,
    removeSelectedTableId,
    setPreSelection,
    setStoreName,
  } = useRoomStore();

  const namedStore = useZustandTableStore(tablesStoreName);
  const namedStoreRef = useRef(namedStore.getState());
  const { getCurrentPlaceId } = usePlaceStore();
  const placeId = getCurrentPlaceId();

  // set the store name for the last place id
  // Use useEffect to avoid infinite loop
  useEffect(() => {
    const placeId = getCurrentPlaceId();
    if (placeId) {
      setStoreName(placeId);
    }
  }, [getCurrentPlaceId]);

  const { setDrawingMode } = useDrawingContext();

  // Reset selected tables when store changes
  useEffect(() => {
    if (namedStoreRef.current) {
      namedStoreRef.current.resetSelectedTables();
    }
    namedStoreRef.current = zustandTableStore(tablesStoreName).getState();
  }, [tablesStoreName]);

  useEffect(() => {
    if (mode === null) {
      setMode(Mode.create);
      setDefaultMode(Mode.create);
    } else if (mode !== Mode.draw) {
      setDrawingMode(DRAWING_MODES.PAUSE);
    }
  }, [mode]);

  const groundRef = useRef<HTMLDivElement>(null);

  const [typeListMode, setTypeListMode] = useState<TypeListTables>(
    TypeListTables.plan
  );

  const handleNumberingTableClick = (id: string) => {
    const table = namedStoreRef.current.getTable(id);
    if (!table) return;

    if (table.selected) {
      addSelectedTableId(id);
    } else {
      removeSelectedTableId(id);
    }
  };

  const onTableClick =
    mode === Mode.numbering ? handleNumberingTableClick : null;

  useEffect(() => {
    // manage escape event
    const handleEscapeEvent = () => {
      namedStoreRef.current.resetSelectedTables();
      setPreSelection(null);
    };

    // add escape event listener
    const removeListener = addEscapeKeyListener(handleEscapeEvent);

    // Cleanup the event listener when the component unmounts
    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      <RoomMenu2
        btnSize={btnSize}
        typeListMode={typeListMode}
        setTypeListMode={setTypeListMode}
      />
      <div
        className="flex w-full bg-background"
        style={{ height: "calc(100vh - 140px)" }}
      >
        {placeId === null ? (
          <div className="flex justify-center items-center w-full">
            <PlaceCreat
              className="max-w-md"
              handleClose={() => {}}
              include={true}
            />
          </div>
        ) : (
          <div className="flex flex-row w-full">
            <GroundSelection
              ref={groundRef}
              id={GROUND_ID}
              typeListMode={typeListMode}
            >
              {typeListMode === "plan" ? (
                <>
                  <ListTablesPlan
                    btnSize={btnSize}
                    editable={mode !== Mode.numbering}
                    onClick={onTableClick}
                  />
                </>
              ) : typeListMode === "list" ? (
                <ListTablesText />
              ) : null}
            </GroundSelection>
            <ValidationFrame btnSize={btnSize} />
          </div>
        )}
      </div>
    </>
  );
};

// Wrap the component with ScaleProvider
export const RoomCreat = () => {
  return (
    <DrawingProvider>
      <RoomCreatTools />
    </DrawingProvider>
  );
};
