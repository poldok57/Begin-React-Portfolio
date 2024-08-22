import React, { useMemo, useState, useRef, forwardRef } from "react";
import { useMemoryContext, Size } from "./MemoryProvider";
import { Button } from "../atom/Button";

import { withMousePosition } from "../windows/withMousePosition";
import { alertMessage } from "../alert-messages/alertMessage";

interface InputDimensionProps {
  id?: string;
  name: string;
  label?: string;
  max: string;
  min: string;
  defaultValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputDimension: React.FC<InputDimensionProps> = ({
  id,
  name,
  label,
  max,
  min,
  defaultValue,
  onChange,
  ...props
}) => {
  id = id || name || "dimention";

  // label with the same name as the input with first letter in uppercase
  label = label || id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <div>
      <label
        className="flex-nowrap p-2 whitespace-nowrap rounded-md border-2 border-primary bg-background"
        htmlFor={id}
      >
        {label} &nbsp;:
        <input
          onChange={onChange}
          min={min}
          max={max}
          name={name}
          defaultValue={defaultValue}
          type="number"
          placeholder="Enter height"
          className="p-1 m-1 rounded-md w-6/10 bg-paper"
          {...props}
        />
      </label>
    </div>
  );
};
interface SelectTypeProps {
  setType: (type: string) => void;
  defaultValue: string;
}
const SelectType = forwardRef<HTMLInputElement, SelectTypeProps>(
  function SelectType(props, ref) {
    return (
      <div
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          props.setType(e.target.value)
        }
        className="flex gap-5 justify-between p-2 w-9/12 rounded-md border-2 border-primary bg-background"
      >
        <label>
          <input
            type="radio"
            value="emoji"
            name="type"
            className="m-1"
            defaultChecked={props.defaultValue === "emoji"}
          />
          Emoji
        </label>
        <label>
          <input
            ref={ref}
            type="radio"
            value="images"
            name="type"
            className="m-2"
            defaultChecked={props.defaultValue === "images"}
          />
          Image
        </label>
      </div>
    );
  }
);

interface ResizePictureProps {
  id: string;
  name: string;
  children: React.ReactNode;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
}

const ResizePicture: React.FC<ResizePictureProps> = ({
  children,
  className,
  min = "50",
  max = "150",
  step = "25",
  ...props
}) => {
  const id = props.id || props.name;
  const { setWidthCards, getWidthCards } = useMemoryContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidthCards(parseInt(e.target.value));
    alertMessage(`Resize picture to ${e.target.value}`);
    const memoryBoard = document.getElementById("memory-board");
    if (memoryBoard) {
      memoryBoard.style.width = "";
      memoryBoard.style.height = "";
    }
  };

  return (
    <label
      className="items-center p-2 text-lg whitespace-nowrap rounded-md border-2 border-primary bg-background"
      htmlFor={id}
    >
      {children} &nbsp;
      <input
        className={className}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        defaultValue={getWidthCards()}
      ></input>
    </label>
  );
};

export const MemoryControl = () => {
  const { resetGame, getSize } = useMemoryContext();
  const inputTypeRef = useRef<HTMLInputElement>(null);
  const [inputType, setInputType] = useState("images"); // ["emoji", "images"

  const [size, setSize] = useState<Size>(getSize() ?? { width: 5, height: 5 });

  const onDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value: number = parseInt(input.value);
    const name = input.name;
    const max: number = parseInt(input.max) || 10;
    const min: number = parseInt(input.min) || 2;

    if (name !== "height" && name !== "width") {
      return false;
    }
    if (!Number.isInteger(Number(value))) {
      alertMessage("Height and width must be an integer");
      return false;
    }
    if (value < min || value > max) {
      alertMessage("Height and width must be between " + min + " and " + max);
      return false;
    }

    alertMessage(`Change ${name} to ${value}`);

    setSize({ ...size, [name]: value });

    return true;
  };

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alertMessage(`Reset game with size: ${size.width}x${size.height}`);
    resetGame(size, inputType);
  };

  return useMemo(() => {
    return (
      <div className="p-2 rounded-md border shadow-lg border-secondary bg-paper">
        <form onSubmit={handleReset} className="flex justify-between p-2">
          <div className="mx-1 w-full">
            <div className="flex justify-center w-full">
              <SelectType
                ref={inputTypeRef}
                defaultValue={inputType}
                setType={setInputType}
              />
            </div>
            <div className="flex gap-2 justify-between items-center pt-2 w-full whitespace-nowrap">
              <InputDimension
                name="width"
                max="8"
                min="3"
                defaultValue={String(size.width)}
                onChange={onDimChange}
              />
              <InputDimension
                name="height"
                max="9"
                min="2"
                defaultValue={String(size.height)}
                onChange={onDimChange}
              />
            </div>
          </div>
          <div className="flex items-center mx-1">
            <Button type="submit" className="h-24">
              Reset
            </Button>
          </div>
        </form>
        {inputType === "images" && (
          <div className="flex justify-center items-center my-2 w-full">
            <ResizePicture
              id="resize"
              name="resize"
              className="w-32 opacity-70 transition-opacity range range-primary hover:opacity-100"
            >
              Resize picture
            </ResizePicture>
          </div>
        )}
      </div>
    );
  }, [size.width, size.height, inputType]);
};

export const MemoryControlWP = withMousePosition(MemoryControl);
