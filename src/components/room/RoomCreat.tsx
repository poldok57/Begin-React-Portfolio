import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/atom/Button";
import { GroupCreat } from "./GroupCreat";
import { TableData, TableType, Position } from "./types";
import { useTableDataStore } from "./stores/tables";
import { RotateCcw, RotateCw, Minus, Plus, Settings } from "lucide-react";
import { isTouchDevice } from "@/lib/utils/device";
import { useThrottle } from "@/hooks/useThrottle";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";

export const GROUND_ID = "back-ground";

const RoomTableWP = withMousePosition(RoomTable);

export const RoomCreat = () => {
  const {
    addTable,
    updateTable,
    deleteTable,
    rotationSelectedTable,
    sizeSelectedTable,
  } = useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);

  const handleAddTable = useThrottle(() => {
    const newTable: TableData = {
      id: "",
      type: TableType.poker,
      selected: true,
      size: 100,
      rotation: 0,
      tableNumber: `${tables.length + 1}`,
      tableText: `Table ${tables.length + 1}`,
    };
    addTable(newTable);
  }, 2000);

  const handleDelete = (id: string) => {
    deleteTable(id);
  };
  // const handleUpdate = (id: string, props: Partial<TableData>) => {
  //   updateTable(id, props);
  // };
  const handleMove = (id: string, position: Position) => {
    updateTable(id, { position });
  };
  const handleChangeSelected = (id: string, selected: boolean) => {
    updateTable(id, { selected });
  };

  const isSelecting = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isSelectingProgress = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: MouseEvent) => {
    if (!groundRef.current) {
      console.error("groundRef is not defined");
      return;
    }
    if (
      containerRef.current &&
      containerRef.current.contains(e.target as Node)
    ) {
      console.log("Click on container");
      return;
    }
    const { left, top } = groundRef.current.getBoundingClientRect();
    isSelecting.current = true;
    startPos.current = {
      x: e.clientX - left,
      y: e.clientY - top,
    };

    isSelectingProgress.current = true;

    if (containerRef.current) {
      containerRef.current.style.display = "block";
      containerRef.current.style.position = "absolute";
      containerRef.current.style.left = `${e.clientX}px`;
      containerRef.current.style.top = `${e.clientY}px`;

      console.log("resize container");
    }
  };

  const handleClickContainer = (e: MouseEvent) => {
    console.log("Click on container event !", e);
  };

  const handleResizeContainer = (
    e: MouseEvent | TouchEvent,
    clientX: number,
    clientY: number
  ) => {
    if (!groundRef.current) {
      return;
    }
    const { left, top } = groundRef.current.getBoundingClientRect();
    if (isSelecting.current && startPos.current && containerRef.current) {
      e.preventDefault();

      const width = clientX - left - startPos.current.x;
      const height = clientY - top - startPos.current.y;
      containerRef.current.style.width = `${Math.abs(width)}px`;
      containerRef.current.style.height = `${Math.abs(height)}px`;
      containerRef.current.style.left = `${
        width < 0 ? clientX - left : startPos.current.x
      }px`;
      containerRef.current.style.top = `${
        height < 0 ? clientY - top : startPos.current.y
      }px`;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleResizeContainer(e, e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (
      !isSelecting.current ||
      !startPos.current ||
      !containerRef.current ||
      !groundRef.current ||
      tables.length <= 0
    ) {
      // console.log("no selection");
      return;
    }

    isSelecting.current = false;
    isSelectingProgress.current = false;

    const rect = containerRef.current.getBoundingClientRect();

    tables.forEach((table) => {
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();

        const isInside =
          tableRect.left >= rect.left &&
          tableRect.right <= rect.right &&
          tableRect.top >= rect.top &&
          tableRect.bottom <= rect.bottom;

        updateTable(table.id, { selected: isInside });
      }
    });
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    console.log("handle Click outside");
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node) &&
      !isSelectingProgress.current
    ) {
      containerRef.current.style.display = "none";
      isSelecting.current = false;
      startPos.current = null;

      console.log("Click outside");
    } else {
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        console.log("Click inside");
      }
    }
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleResizeContainer(e, e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    handleMouseUp();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        tables.forEach((table) => {
          updateTable(table.id, { selected: false });
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (groundRef.current) {
      groundRef.current.addEventListener("mousedown", handleMouseDown);
      groundRef.current.addEventListener("mousemove", handleMouseMove);
      groundRef.current.addEventListener("mouseup", handleMouseUp);
      groundRef.current.addEventListener("mouseleave", handleMouseUp);

      groundRef.current.addEventListener("touchstart", handleTouchStart);
      groundRef.current.addEventListener("touchmove", handleTouchMove);
      groundRef.current.addEventListener("touchend", handleTouchEnd);
      groundRef.current.addEventListener("touchcancel", handleTouchEnd);
    }
    if (containerRef.current) {
      containerRef.current.addEventListener("mousedown", handleClickContainer);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      groundRef.current?.removeEventListener("mousedown", handleMouseDown);
      groundRef.current?.removeEventListener("mousemove", handleMouseMove);
      groundRef.current?.removeEventListener("mouseup", handleMouseUp);
      groundRef.current?.removeEventListener("mouseleave", handleMouseUp);
      groundRef.current?.removeEventListener("touchstart", handleTouchStart);
      groundRef.current?.removeEventListener("touchmove", handleTouchMove);
      groundRef.current?.removeEventListener("touchend", handleTouchEnd);
      groundRef.current?.removeEventListener("touchcancel", handleTouchEnd);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.position = "absolute";
      containerRef.current.style.border = "2px dashed gray";
      containerRef.current.style.backgroundColor = "rgba(128, 128, 128, 0.2)";
      containerRef.current.style.pointerEvents = "none";
    }
  }, []);

  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="flex flex-row w-full">
        <GroupCreat />
        <div className="flex flex-col gap-2 p-2">
          <h1>RoomCreate</h1>
          <Button onClick={handleAddTable}>Add table</Button>
          <div className="flex flex-col gap-2">
            <h2>Modifier les tables sélectionnées</h2>
            <div className="flex flex-col gap-2 justify-center">
              <div className="flex flex-row gap-1 justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => rotationSelectedTable(-15)}
                >
                  <RotateCcw size={btnSize} />
                </button>
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => rotationSelectedTable(15)}
                >
                  <RotateCw size={btnSize} />
                </button>
              </div>
              <div className="flex flex-row gap-1 justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => sizeSelectedTable(-10)}
                >
                  <Minus size={btnSize} />
                </button>
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => sizeSelectedTable(10)}
                >
                  <Plus size={btnSize} />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => {
                    /* Logique pour modifier les paramètres */
                  }}
                >
                  <Settings size={btnSize} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div ref={groundRef} className="relative w-full h-full" id={GROUND_ID}>
          <div
            ref={containerRef}
            id="container"
            style={{ display: "hidden" }}
          ></div>
          {tables.map((table, index) => {
            const left = table?.position?.left ?? 50 + index * 10;
            const top = table?.position?.top ?? 50 + index * 10;
            return (
              <RoomTableWP
                className="absolute"
                key={table.id}
                id={table.id}
                table={table}
                btnSize={btnSize}
                onDelete={handleDelete}
                onMove={handleMove}
                changeSelected={handleChangeSelected}
                draggable={true}
                trace={false}
                withTitleBar={false}
                withToggleLock={false}
                titleText={table.tableText}
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  top: `${top}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
