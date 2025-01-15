import React, {
  ReactNode,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";

interface ToggleSwitchProps {
  color?: "red" | "green" | "blue";
  initialColor?: "red" | "green" | "blue" | "gray";
  defaultChecked?: boolean;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  children?: ReactNode;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  children = null,
  onChange,
  defaultChecked = false,
  color = "blue",
  id,
  initialColor = "gray",
  className,
  ...props
}) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked);

  useEffect(() => {
    if (defaultChecked !== undefined) {
      setChecked(defaultChecked);
    }
  }, [defaultChecked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <div {...props} className={className}>
      <label className="inline-flex relative items-center ml-1 cursor-pointer">
        <input
          id={id}
          alt="toggle switch input"
          type="checkbox"
          className="sr-only peer"
          onChange={handleChange}
          checked={checked}
        />
        <div
          className={clsx(
            "h-4 w-7 rounded-full after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
            "peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800",
            { "bg-gray-200": initialColor === "gray" },
            { "bg-green-600": initialColor === "green" },
            { "bg-red-600": initialColor === "red" },
            { "bg-blue-600": initialColor === "blue" },
            { "peer-checked:bg-red-600": color === "red" },
            { "peer-checked:bg-green-600": color === "green" },
            { "peer-checked:bg-blue-600": color === "blue" }
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
