import React, { useMemo, useState, useRef, forwardRef } from "react";
import { useMemoryContext } from "./MemoryProvider";
import { Button } from "../atom/Button";

import { withMousePosition } from "../windows/withMousePosition";
import { alertMessage } from "../alert-messages/alertMessage";

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
        className="flex-nowrap p-2 whitespace-nowrap rounded-md border-2 border-primary bg-background"
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
          className="p-1 m-1 rounded-md w-6/10 bg-paper"
        />
      </label>
    </div>
  );
});

const SelectType = forwardRef(function SelectType(props, ref) {
  return (
    <div
      onChange={(e) => props.setType(e.target.value)}
      className="flex gap-5 justify-between p-2 w-9/12 rounded-md border-2 border-primary bg-background"
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
    const memoryBoard = document.getElementById("memory-board");
    if (memoryBoard) {
      memoryBoard.style.width = null;
      memoryBoard.style.height = null;
    }
  };

  return (
    <label
      className="items-center p-2 text-lg whitespace-nowrap rounded-md border-2 border-primary bg-background"
      htmlFor={id}
    >
      {children} &nbsp;
      <input
        className="w-32 opacity-70 transition-opacity range range-primary hover:opacity-100"
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
    alertMessage(`Reset game with size: ${size.width}x${size.height}`);

    resetGame(size, inputType);
  };

  const size = getSize() ?? { width: 5, height: 5 };

  return useMemo(() => {
    return (
      <div className="rounded-md border shadow-lg border-secondary bg-paper">
        <form onSubmit={handleReset} className="flex justify-between p-2">
          <div className="mx-1 w-full">
            <div className="flex justify-center w-full">
              <SelectType ref={inputTypeRef} setType={setInputType} />
            </div>
            <div className="flex gap-2 justify-between items-center pt-2 w-full whitespace-nowrap">
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
          <div className="flex items-center mx-1">
            <Button type="submit" className="h-24">
              Reset
            </Button>
          </div>
        </form>
        {inputType === "images" && (
          <div className="flex justify-center items-center my-2 w-full">
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
