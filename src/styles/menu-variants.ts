import { cva } from "class-variance-authority";

export const menuRoomVariants = cva(
  "z-40 p-1 bg-white rounded-md shadow-sm select-none",
  {
    variants: {
      width: {
        44: "min-w-44",
        56: "min-w-56",
        64: "min-w-64",
      },
    },
    defaultVariants: {
      width: 44,
    },
  }
);
