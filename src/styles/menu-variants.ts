import { cva } from "class-variance-authority";

export const menuRoomVariants = cva(
  "relative p-2 bg-white rounded-md select-none gap-2 flex flex-col",
  {
    variants: {
      width: {
        44: "min-w-44",
        56: "min-w-56",
        64: "min-w-64",
        72: "min-w-72",
        80: "min-w-80",
        96: "min-w-96",
      },
      shadow: {
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        none: "shadow-none",
      },
      border: {
        none: "border-none",
        gray: "border border-gray-300",
        warning: "border border-warning",
      },
      zIndex: {
        none: "",
        "20": "z-20",
        "30": "z-30",
        "40": "z-40",
        "50": "z-50",
      },
    },
    defaultVariants: {
      width: 44,
      shadow: "md",
      border: "gray",
      zIndex: "40",
    },
  }
);

export const menuRoomContainer = cva("translate-y-24", {
  variants: {
    alignement: {
      absolute: "absolute",
      fixed: "fixed",
      right: "fixed top-5 right-6",
      translateRight: "fixed top-5 right-5 translate-x-full",
    },
    zIndex: {
      "30": "z-30",
      "40": "z-40",
      "50": "z-50",
    },
  },
  defaultVariants: {
    alignement: "absolute",
    zIndex: "30",
  },
});
