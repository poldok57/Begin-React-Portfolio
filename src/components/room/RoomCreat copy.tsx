import React, { useEffect, useRef } from "react";
import { GroupCreat } from "./GroupCreat";
import { Position, TableData } from "./types";
import { useTableDataStore } from "./stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { mouseIsInsideComponent } from "@/lib/mouse-position";
import { Rectangle } from "@/lib/canvas/types";
import { RoomMenu } from "./RoomMenu";

export const GROUND_ID = "back-ground";

const MARGIN = 10;

const RoomTableWP = withMousePosition(RoomTable);

export const RoomCreat = () => {
  const { updateTable, deleteTable } = useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);

  const handleDelete = (id: string) => {
    deleteTable(id);
  };

  const handleMove = (id: string, position: Position) => {
    updateTable(id, { position });
  };
  const handleChangeSelected = (id: string, selected: boolean) => {
    if (selectedArea.current) {
      return;
    }
    updateTable(id, { selected });
  };

  const isSelecting = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isSelectingProgress = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const areaOffsetRef = useRef<Position | null>(null);
  const selectedArea = useRef<boolean>(false);
  const selectedTablesRef = useRef<TableData[]>([]);

  const onZoneSelectedStart = (_clientX: number, _clientY: number) => {
    // console.log("onZoneSelectedStart", clientX, clientY);

    selectedArea.current = true;
  };

  const onZoneSelectedMove = (clientX: number, clientY: number) => {
    if (!groundRef.current) {
      return;
    }

    selectedTablesRef.current.forEach((table) => {
      if (table.offset) {
        const position: Position = {
          left: Math.round(clientX + table.offset.left),
          top: Math.round(clientY + table.offset.top),
        };
        updateTable(table.id, { position });

        console.log(
          `table (${table.tableNumber}) move`,
          position,
          table.selected
        );

        const tableElement = document.getElementById(table.id);
        if (tableElement) {
          tableElement.style.position = "absolute";
          tableElement.style.left = `${position.left}px`;
          tableElement.style.top = `${position.top}px`;
          // console.log("move", position);
        }
      }
    });
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      selectedArea.current = false;
      tables.forEach((table) => {
        updateTable(table.id, { offset: undefined });
      });
      return;
    }

    const updatedTables = tables.map((table) => {
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();

        const isInside =
          tableRect.left >= rect.left - MARGIN &&
          tableRect.right <= rect.right + MARGIN &&
          tableRect.top >= rect.top - MARGIN &&
          tableRect.bottom <= rect.bottom + MARGIN
            ? true
            : false;

        const offset = {
          left: tableRect.left - rect.left,
          top: tableRect.top - rect.top,
        };
        console.log(
          `table[${table.id}] ${isInside ? "inside" : "outside"}`,
          offset
        );
        return { ...table, selected: isInside, offset };
      }
      return table;
    });

    selectedTablesRef.current = updatedTables.filter((table) => table.selected);

    updatedTables.forEach((table) => {
      updateTable(table.id, { selected: table.selected, offset: table.offset });
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!groundRef.current || !containerRef.current) {
      console.error("groundRef or containerRef is not defined");
      return;
    }
    // clic on container
    if (containerRef.current.contains(e.target as Node)) {
      areaOffsetRef.current = {
        left: containerRef.current.offsetLeft - e.clientX,
        top: containerRef.current.offsetTop - e.clientY,
      };

      onZoneSelectedStart(e.clientX, e.clientY);
      return;
    }

    if (mouseIsInsideComponent(e, containerRef.current)) {
      // mouse inside container
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
    }
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
      containerRef.current.style.cursor = "move";
    }
  };

  const handleMoveContainer = (clientX: number, clientY: number) => {
    if (!areaOffsetRef.current || !containerRef.current) {
      return;
    }

    const newLeft = clientX + areaOffsetRef.current.left;
    const newTop = clientY + areaOffsetRef.current.top;

    containerRef.current.style.left = `${newLeft}px`;
    containerRef.current.style.top = `${newTop}px`;

    onZoneSelectedMove(newLeft, newTop);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (areaOffsetRef.current) {
      handleMoveContainer(e.clientX, e.clientY);
      return;
    }
    handleResizeContainer(e, e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    areaOffsetRef.current = null;

    if (
      !isSelecting.current ||
      !startPos.current ||
      !containerRef.current ||
      !groundRef.current ||
      tables.length <= 0
    ) {
      onZoneSelectedEnd(null);
      return;
    }

    isSelecting.current = false;
    isSelectingProgress.current = false;

    const rect = containerRef.current.getBoundingClientRect();

    onZoneSelectedEnd(rect);
  };

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
    if (e.touches.length <= 0) {
      return;
    }
    const touch = e.touches[0];

    if (areaOffsetRef.current) {
      handleMoveContainer(touch.clientX, touch.clientY);
      return;
    }

    handleResizeContainer(e, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
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
    };
  }, []);

  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="flex flex-row w-full">
        <GroupCreat />
        <RoomMenu btnSize={btnSize} />
        <div ref={groundRef} className="relative w-full h-full" id={GROUND_ID}>
          <div
            className="hover:cursor-move"
            ref={containerRef}
            id="container"
            style={{
              position: "absolute",
              display: "none",
              border: "2px dashed gray",
              backgroundColor: "rgba(128, 128, 128, 0.2)",
              cursor: "move",
            }}
          ></div>
          {tables.map((table, index) => {
            const left = table?.position?.left ?? 50 + index * 10;
            const top = table?.position?.top ?? 50 + index * 10;
            return (
              <RoomTableWP
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
