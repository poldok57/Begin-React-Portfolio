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
interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  component?: "input" | "textarea";
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  component,
  ...props
}) => {
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
        className="p-3 mt-1 w-full text-sm bg-transparent rounded border-2 border-opacity-50 border-primary focus:border-opacity-100 focus:bg-paper"
        id={id}
        {...props}
      />
    </div>
  );
};
