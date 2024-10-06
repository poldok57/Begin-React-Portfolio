import { cva } from "class-variance-authority";

export const menuRoomVariants = cva("z-40 p-2 bg-white rounded-md shadow-sm", {
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
});
