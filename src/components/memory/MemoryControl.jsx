import React, { useMemo, useState, useRef, forwardRef } from "react";
import { useMemoryContext } from "./MemoryProvider";
import { Button } from "../atom/Button";

import { withMousePosition } from "../../hooks/withMousePosition";
import { alertMessage } from "../../hooks/alertMessage";

const InputDimension = forwardRef(function InputDimension(props, ref) {
  const id = props.id || props.name;

  // label with the same name as the input with first letter in uppercase
  const label = props.label || id.charAt(0).toUpperCase() + id.slice(1);

  const onChange = (e) => {
    const input = e.target;
    const value = input.value;
    const name = input.name;
    const max = input.max || 10;
    const min = input.min || 2;

    if (name === "height" || name === "width") {
      if (!Number.isInteger(Number(value))) {
        alertMessage("Height and width must be an integer");
        return false;
      }
      if (value < min || value > max) {
        alertMessage("Height and width must be between " + min + " and " + max);
        return false;
      }
    }

    //  alertMessage(`Change ${name} to ${value}`);
    return true;
  };

  return (
    <div>
      <label
        className="flex-nowrap whitespace-nowrap rounded-md border-2 border-primary bg-background p-2"
        htmlFor={id}
      >
        {label} &nbsp;:
        <input
          ref={ref}
          id={id}
          {...props}
          onChange={(e) => {
            onChange(e);
          }}
          type="number"
          placeholder="Enter height"
          className="w-6/10 m-1 rounded-md bg-paper p-1"
        />
      </label>
    </div>
  );
});

const SelectType = forwardRef(function SelectType(props, ref) {
  return (
    <div
      onChange={(e) => props.setType(e.target.value)}
      className="flex w-9/12 justify-between gap-5 rounded-md border-2 border-primary bg-background p-2"
    >
      <label>
        <input type="radio" value="emoji" name="type" className="m-1" />
        Emoji
      </label>
      <label>
        <input
          ref={ref}
          type="radio"
          value="images"
          name="type"
          className="m-2"
          defaultChecked
        />
        Image
      </label>
    </div>
  );
});

const ResizePicture = ({ children, ...props }) => {
  const id = props.id || props.name;
  const { setWidthCards, getWidthCards } = useMemoryContext();

  const onChange = (e) => {
    setWidthCards(e.target.value);
    alertMessage(`Resize picture to ${e.target.value}`);
  };

  return (
    <label
      className="whitespace-nowrap rounded-md border-2 border-primary bg-background p-2"
      htmlFor={id}
    >
      {children} &nbsp;
      <input
        className="h-2 w-32 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
        id={id}
        type="range"
        min="50"
        max="150"
        step="25"
        onChange={onChange}
        defaultValue={getWidthCards()}
      ></input>
    </label>
  );
};

export const MemoryControl = () => {
  const { resetGame, getSize } = useMemoryContext();
  const inputRowsRef = useRef();
  const inputColsRef = useRef();
  const inputTypeRef = useRef("images");
  const [inputType, setInputType] = useState("images"); // ["emoji", "images"

  const handleReset = (e) => {
    e.preventDefault();
    // Utilisez les valeurs actuelles des refs pour mettre à jour les états
    const size = {
      width: Math.max(parseInt(inputColsRef.current.value), 3),
      height: Math.max(parseInt(inputRowsRef.current.value), 2),
    };
    alertMessage(
      `Reset game with size: ${size.width}x${size.height}, type: ${inputTypeRef.current}`
    );

    resetGame(size, inputType);
  };

  const size = getSize() ?? { width: 5, height: 5 };

  return useMemo(() => {
    return (
      <div className="rounded-md border border-secondary bg-paper shadow-lg">
        <form onSubmit={handleReset} className="flex justify-between p-2">
          <div className="mx-1 w-full ">
            <div className="flex w-full justify-center">
              <SelectType ref={inputTypeRef} setType={setInputType} />
            </div>
            <div className="flex w-full items-center justify-between gap-2 whitespace-nowrap pt-2">
              <InputDimension
                ref={inputColsRef}
                name="width"
                max="8"
                min="3"
                defaultValue={size.width}
              />
              <InputDimension
                ref={inputRowsRef}
                name="height"
                max="9"
                min="2"
                defaultValue={size.height}
              />
            </div>
          </div>
          <div className="mx-1 flex items-center">
            <Button type="submit" className="h-24">
              Reset
            </Button>
          </div>
        </form>
        {inputType === "images" && (
          <div className="my-2 flex w-full justify-center">
            <ResizePicture id="resize" name="resize">
              Resize picture
            </ResizePicture>
          </div>
        )}
      </div>
    );
  }, [size.width, size.height, inputType]);
};

export const MemoryControlWP = withMousePosition(MemoryControl);
