"use client";
import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useTaskbar } from "./store";
import { TITLE_HEIGHT } from "./window-size";
import {
  taskbarContainerVariants,
  taskbarItemVariants,
  selectBoxVariants,
} from "@/styles/taskbar-variants";
import { CloseButton } from "./CloseButton";
import clsx from "clsx";

const TASKBAR_PARAMS_KEY = "taskbarParams";

type TaskbarType = "horizontal" | "vertical" | "circular";
type TaskbarPosition = "left" | "right";

type TaskbarParams = {
  layout: TaskbarType;
  position: TaskbarPosition;
  dynamic: boolean;
};

const DEFAULT_PARAMS: TaskbarParams = {
  layout: "horizontal",
  position: "right",
  dynamic: false,
};

interface TaskbarTypeSelectProps {
  setMenuOpen: (open: boolean) => void;
  barParams: TaskbarParams;
  setParams: (
    param: keyof TaskbarParams,
    value: TaskbarParams[keyof TaskbarParams]
  ) => void;
  position: TaskbarPosition;
}

const TaskbarTypeSelect: React.FC<TaskbarTypeSelectProps> = ({
  setMenuOpen,
  barParams,
  setParams,
  position,
}: TaskbarTypeSelectProps) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setMenuOpen]);

  return (
    <div
      ref={menuRef}
      className={clsx(
        "absolute  bottom-full z-40 p-2 bg-gray-300 rounded-md border border-gray-500 shadow-lg text-nowrap w-fit",
        position === "left" ? "left-0" : "right-0"
      )}
    >
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Taskbar Type
        </label>
        <select
          value={barParams.layout}
          onChange={(e) => setParams("layout", e.target.value as TaskbarType)}
          className={selectBoxVariants()}
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="circular">Circular</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position
        </label>
        <select
          value={barParams.position}
          onChange={(e) =>
            setParams("position", e.target.value as TaskbarPosition)
          }
          className={selectBoxVariants()}
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>

        <div className="flex flex-row gap-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="dynamic"
          >
            Dynamique
          </label>
          <input
            id="dynamic"
            type="checkbox"
            checked={barParams.dynamic}
            onChange={(e) => setParams("dynamic", e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export const Taskbar = () => {
  const { taskbarItems } = useTaskbar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [barParams, setBarParams] = useState<TaskbarParams>(() => {
    if (typeof window !== "undefined") {
      const savedParams = localStorage.getItem(TASKBAR_PARAMS_KEY);
      return savedParams ? JSON.parse(savedParams) : DEFAULT_PARAMS;
    }
    return DEFAULT_PARAMS;
  });

  useEffect(() => {
    localStorage.setItem(TASKBAR_PARAMS_KEY, JSON.stringify(barParams));
  }, [barParams]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOneParam = (
    param: keyof TaskbarParams,
    value: TaskbarParams[typeof param]
  ) => {
    setBarParams({ ...barParams, [param]: value });
  };

  return (
    <div
      className={taskbarContainerVariants({
        layout: isMounted ? barParams.layout : DEFAULT_PARAMS.layout,
        position: isMounted ? barParams.position : DEFAULT_PARAMS.position,
        dynamic: isMounted ? barParams.dynamic : DEFAULT_PARAMS.dynamic,
        className: "z-30",
      })}
    >
      {taskbarItems.length > 0 && (
        <div
          className={clsx("relative", {
            "w-full": barParams.layout !== "horizontal",
          })}
        >
          <div
            className={clsx("flex flex-row items-end", {
              "w-full": barParams.layout !== "horizontal",
              "justify-end": barParams.position === "right",
              "justify-start": barParams.position === "left",
            })}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <Settings size={20} />
            </button>
          </div>
          {menuOpen && (
            <TaskbarTypeSelect
              setMenuOpen={setMenuOpen}
              barParams={barParams}
              setParams={setOneParam}
              position={barParams.position}
            />
          )}
        </div>
      )}

      {taskbarItems.map((window) => (
        <div
          key={window.id}
          className={taskbarItemVariants({
            layout: barParams.layout,
            dynamic: barParams.dynamic,
            overflow: window.onClose ? true : false,
            className: "group/item",
          })}
          style={{
            ...(window.bgColor ? { backgroundColor: window.bgColor } : {}),
            ...(window.color ? { color: window.color } : {}),
            height: TITLE_HEIGHT,
          }}
          onClick={() => window.toggleUp()}
        >
          <div className="flex justify-between items-center w-full">
            {window.title}
          </div>
          {window.onClose && (
            <CloseButton
              layout="circle"
              size="sm"
              onClick={window.onClose}
              className="absolute top-1 right-1 opacity-30 group-hover/item:opacity-90"
            />
          )}
        </div>
      ))}
    </div>
  );
};
