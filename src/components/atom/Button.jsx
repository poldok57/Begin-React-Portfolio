import clsx from "clsx";

/**
 * Simple button for the application
 *
 * @param props All props that a button can take
 * @param children Children of the button
 * @param className Class name of the button
 * @returns {JSX.Element}
 * @constructor
 */
export const Button = ({
  children,
  disabled,
  selected,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "inline-block rounded bg-primary px-8 py-3 text-sm font-medium text-white transition",

        "disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600",
        className,
        {
          "focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50":
            !selected,
          "outline-double ring-4 ring-secondary ring-opacity-80": selected,
          "hover:scale-105  hover:shadow-xl": !disabled,
          "active:bg-primary active:opacity-80": !disabled,
        }
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
