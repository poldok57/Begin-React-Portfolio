import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

const FormattedRapport: React.FC<{
  value: number;
  max: string;
  decimal: number;
}> = ({ value, max, decimal }) => {
  const maxDigits = max === "100" ? 2 : max.toString().length;
  const valueDigits =
    decimal === 0
      ? value.toString().length
      : Math.floor(value).toString().length;

  return (
    <>
      {valueDigits < maxDigits ? (
        <span style={{ opacity: 0.2 }}>
          {"0".repeat(maxDigits - valueDigits)}
        </span>
      ) : null}
      {value.toString()}
      {decimal > 0 && !value.toString().includes(".")
        ? "." + "0".repeat(decimal)
        : null}
      {max !== "100" ? "/" + max : null}
    </>
  );
};

const getDecimalCount = (num: string) => {
  if (num.includes(".")) {
    return num.split(".")[1].length;
  }
  return 0;
};

export const RangeInput: React.FC<{
  id: string;
  value: number;
  className?: string;
  style?: React.CSSProperties;
  min: string;
  max: string;
  step: string;
  onChange: (_value: number) => void;
  label: string;
  isTouch?: boolean;
}> = ({
  id,
  value,
  className,
  style,
  min,
  max,
  step,
  onChange,
  label,
  isTouch = false,
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (newValue: number) => {
    newValue = Math.min(newValue, parseFloat(max));
    newValue = Math.max(newValue, parseFloat(min));
    setInputValue(newValue);
    onChange(newValue);
  };
  const handleIncrement = (step: number) =>
    handleChange(Math.min(inputValue + step, parseFloat(max)));

  const decimalCount = getDecimalCount(step);

  return (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="mb-1 text-sm text-nowrap">
        {label}{" "}
        <FormattedRapport value={inputValue} max={max} decimal={decimalCount} />
      </label>
      <div className="flex items-center">
        {isTouch && (
          <button
            onClick={() => handleIncrement(-parseFloat(step))}
            className="z-[1] p-1 text-white rounded-lg opacity-40 bg-secondary focus:opacity-100"
          >
            <Minus size={22} />
          </button>
        )}
        <input
          id={id}
          type="range"
          value={inputValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className={clsx(className, "-mx-3")}
          style={style}
        />
        {isTouch && (
          <button
            onClick={() => handleIncrement(parseFloat(step))}
            className="z-[1] p-1 text-white rounded-lg opacity-40 bg-secondary focus:opacity-100"
          >
            <Plus size={22} />
          </button>
        )}
      </div>
    </div>
  );
};
