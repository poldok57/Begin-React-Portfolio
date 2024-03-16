import React from "react";
import clsx from "clsx";

export const ToggleSwitch = ({
  id,
  children,
  onChange,
  defaultChecked,
  color = "blue",
  ...props
}) => {
  if (!id) {
    // generate a random id if none is provided
    id = "id" + Math.random().toString(36).substring(7);
  }

  return (
    <div {...props}>
      <label
        htmlFor={id}
        className="relative inline-flex cursor-pointer items-center"
      >
        <input
          alt="toggle switch input"
          type="checkbox"
          id={id}
          className="peer sr-only"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <div
          className={clsx(
            "h-4 w-7 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
            "peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800",
            { "peer-checked:bg-red-600": color == "red" },
            { "peer-checked:bg-green-600": color == "green" },
            { "peer-checked:bg-blue-600": color == "blue" }
          )}
        ></div>
        {children && (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {children}
          </span>
        )}
      </label>
    </div>
  );
};

export default ToggleSwitch;
