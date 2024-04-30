import { useId } from "react";

/**
 * TextField is an input field with a label !
 *
 * @param props All props that a common input or textarea take !
 * @param label Label of the input field
 * @param component Component of the input field (textarea or input)
 * @returns {JSX.Element}
 * @constructor
 */
export const TextField = ({ label, component, ...props }) => {
  const id = useId();

  const Component = component || "input";

  return (
    <div className="relative">
      <label
        className="block text-xs font-medium text-primary md:text-sm"
        htmlFor={id}
      >
        {label}
      </label>

      <Component
        className="mt-1 w-full rounded border-2 border-primary border-opacity-50 bg-transparent p-3 text-sm focus:border-opacity-100 focus:bg-paper"
        id={id}
        {...props}
      />
    </div>
  );
};
