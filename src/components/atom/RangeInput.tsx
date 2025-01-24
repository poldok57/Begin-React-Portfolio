import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

const getDecimalCount = (num: string) => {
  if (num.includes(".")) {
    return num.split(".")[1].length;
  }
  return 0;
};

const FormattedRapport: React.FC<{
  value: number;
  max: string;
  decimal: number;
}> = ({ value, max, decimal }) => {
  const maxDigits =
    parseFloat(max) <= 1 ? 1 : max === "100" ? 2 : max.toString().length;
  const strNumber = value.toString();
  const strInteger = strNumber.split(".")[0];
  const nbDigits = strInteger.length;
  const nbDecimal = getDecimalCount(strNumber);

  let strDecimal = "";
  if (decimal > 0) {
    strDecimal = strNumber.split(".")[1] || "";

    if (nbDecimal > 0 && nbDecimal > decimal) {
      strDecimal = strDecimal.slice(0, decimal);
    } else {
      strDecimal += "0".repeat(decimal - nbDecimal);
    }
    strDecimal = "." + strDecimal;
  }

  return (
    <span style={{ opacity: 0.6 }}>
      {nbDigits < maxDigits ? (
        <span style={{ opacity: 0.3 }}>{"0".repeat(maxDigits - nbDigits)}</span>
      ) : null}
      {strInteger + strDecimal}

      {max !== "100" ? "/" + max : null}
    </span>
  );
};

export const RangeInput: React.FC<{
  id: string;
  value: number;
  className?: string;
  style?: React.CSSProperties;
  min: string;
  max: string;
  step?: string;
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
  step = "1",
  onChange,
  label,
  isTouch = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const decimalCount = getDecimalCount(step.toString());

  const handleChange = (newValue: number) => {
    newValue = Math.min(newValue, parseFloat(max));
    newValue = Math.max(newValue, parseFloat(min));
    setInputValue(newValue);
    onChange(newValue);
  };
  const handleIncrement = (step: number) => {
    // console.log("value:", inputValue, "step:", step);
    const newValue = Number((inputValue + step).toFixed(decimalCount));
    // console.log("new value:", newValue);
    handleChange(newValue);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className={clsx("-mx-3", className)}
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
