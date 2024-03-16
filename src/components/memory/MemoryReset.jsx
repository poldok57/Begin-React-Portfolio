import { useMemoryContext } from "./MemoryProvider";
import { Button } from "../atom/Button";
import { useRef, forwardRef, memo } from "react";
import { useMessage } from "../../context/MessageProvider";
import { withMousePosition } from "../../context/withMousePosition";

const InputDimension = forwardRef(function InputDimension(props, ref) {
  const id = props.id || props.name;
  const { alertMessage } = useMessage();

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
    <>
      <label
        className="rounded-md border-2 border-primary bg-background p-1"
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
          className="w-6/10 mx-2 my-1 rounded-md bg-paper p-1"
        />
      </label>
    </>
  );
});

const SelectType = forwardRef(function SelectType(props, ref) {
  const onChange = (e) => {
    const input = e.target;
    const value = input.value;
    ref.current = value;
  };

  return (
    <div
      onChange={onChange}
      className="flex w-9/12 justify-between gap-5 rounded-md border-2 border-primary bg-background p-2"
    >
      <label>
        <input type="radio" value="emoji" name="type" className="m-1" />
        Emoji
      </label>
      <label>
        <input
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

export const MemoryReset = () => {
  const { resetGame, getSize } = useMemoryContext();
  const inputRowsRef = useRef();
  const inputColsRef = useRef();
  const inputTypeRef = useRef("images");
  const { alertMessage } = useMessage();

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

    resetGame(size, inputTypeRef.current);
  };

  const size = getSize() ?? { width: 6, height: 6 };

  return (
    <div>
      <form
        onSubmit={handleReset}
        className="m-auto flex justify-between rounded-md border border-secondary bg-paper p-2 shadow-lg"
      >
        <div className="mx-1">
          <div className="flex w-full justify-center">
            <SelectType ref={inputTypeRef} />
          </div>
          <div className="flex w-full items-center justify-between gap-2 pt-2">
            <InputDimension
              ref={inputColsRef}
              name="width"
              max="6"
              min="3"
              defaultValue={size.width}
            />
            <InputDimension
              ref={inputRowsRef}
              name="height"
              max="6"
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
    </div>
  );
};

export const MemoryResetWP = withMousePosition(MemoryReset);
