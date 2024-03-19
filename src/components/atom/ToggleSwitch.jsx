import React from "react";
import clsx from "clsx";

/**
 * ToggleSwitch component
 * @param {object} props
 * @param {string} props.color - color of the switch (red, green, blue)
 * @param {string} props.initialColor - initial color of the switch (red, green, blue, gray)
 * @param {boolean} props.defaultChecked - initial state of the switch
 * @param {function} props.onChange - function to call when the switch is toggled
 * @param {object} props.children - children to render
 */
export const ToggleSwitch = ({
  children,
  onChange,
  defaultChecked,
  color = "blue",
  initialColor = "gray",
  ...props
}) => {
  return (
    <div {...props}>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          alt="toggle switch input"
          type="checkbox"
          className="peer sr-only"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <div
          className={clsx(
            "h-4 w-7 rounded-full  after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
            "peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800",
            { "bg-gray-200": initialColor == "gray" },
            { "bg-green-600": initialColor == "green" },
            { "bg-red-600": initialColor == "red" },
            { "bg-blue-600": initialColor == "blue" },
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
