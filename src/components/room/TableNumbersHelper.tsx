import { NumberingMode } from "./TableNumbers";

export const TableNumbersHelper = ({
  nbSelected,
  withAngle,
  numberingMode,
  tableNumber,
}: {
  nbSelected: number;
  withAngle: boolean;
  numberingMode: NumberingMode;
  tableNumber: number | null;
}) => {
  return (
    <>
      <p className="p-2 mt-2 text-center text-gray-800 bg-red-200 rounded border-2 border-red-500">
        {nbSelected === 0 && numberingMode !== NumberingMode.OneByOne ? (
          <>
            Clic on the <b>first table</b> of the line
          </>
        ) : nbSelected === 1 && numberingMode !== NumberingMode.OneByOne ? (
          <>
            Clic on the <b>last table</b> of the line
          </>
        ) : nbSelected === 2 && numberingMode === NumberingMode.ByArea ? (
          <>
            Clic on a table of the <b>last line</b>
          </>
        ) : nbSelected > 2 && withAngle ? (
          <>
            Click <b>last angle</b> table
          </>
        ) : nbSelected > 1 && numberingMode === NumberingMode.ByLine ? (
          <>Validate the the line</>
        ) : numberingMode === NumberingMode.OneByOne && tableNumber !== null ? (
          <b>Select the table</b>
        ) : (
          <>Validate your choice</>
        )}
      </p>
      {numberingMode !== NumberingMode.OneByOne && tableNumber === null && (
        <p className="p-2 mt-2 text-lg font-bold bg-red-300 rounded border-2 border-red-500 text-gray-950">
          You need a digit to increment the table numbers !
        </p>
      )}
    </>
  );
};
