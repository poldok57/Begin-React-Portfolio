import { useState, useRef } from "react";
import { Button } from "@/components/atom/Button";
import { useTableDataStore } from "./stores/tables";
import { clsx } from "clsx";

interface TableNumbersProps {
  className?: string;
  setTableCurrentNumber: (number: string) => void;
  tableCurrentNumber: string | null;
}

const TableNumbers = ({
  className,
  setTableCurrentNumber,
  tableCurrentNumber,
}: TableNumbersProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { tables, updateTable } = useTableDataStore();

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <Button onClick={() => setIsOpen(!isOpen)}>table numbering</Button>
      {isOpen && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg">
          <div className="mb-2">
            <label
              htmlFor="tableNumber"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              table number
            </label>
            <input
              type="text"
              id="tableNumber"
              value={tableCurrentNumber ?? ""}
              onChange={(e) => setTableCurrentNumber(e.target.value)}
              className="px-2 py-1 w-full text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { TableNumbers };
