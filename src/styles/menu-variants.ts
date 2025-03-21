import { cva } from "class-variance-authority";

export const menuRoomVariants = cva(
  ["relative p-2 rounded-md select-none gap-2 flex flex-col"],
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
      bg: {
        white: "bg-white",
        base: "bg-base-100",
        "100": "bg-gray-100",
        "200": "bg-gray-200",
        "300": "bg-gray-300",
        "400": "bg-gray-400",
        "500": "bg-gray-500",
      },
      maxHeight: {
        "200": "overflow-y-auto max-h-[calc(100vh-200px)]",
        "300": "overflow-y-auto max-h-[calc(100vh-300px)]",
        "400": "overflow-y-auto max-h-[calc(100vh-400px)]",
        colorpicker:
          "overflow-y-auto max-h-[calc(100vh-200px)] overflow-x-visible",
        none: "",
      },
    },
    defaultVariants: {
      width: 44,
      shadow: "md",
      border: "gray",
      zIndex: "40",
      bg: "white",
      maxHeight: "200",
    },
  }
);

export const designFieldsetVariants = cva(
  ["flex p-2 rounded-lg", "border-2 border-secondary"],
  {
    variants: {
      gap: {
        "2": "gap-2",
        "4": "gap-4",
        "5": "gap-5",
        "6": "gap-6",
        none: "",
      },
      flex: {
        row: "flex-row",
        col: "flex-col",
        none: "",
      },
      justify: {
        center: "justify-center",
        between: "justify-between",
        end: "justify-end",
        start: "justify-start",
        none: "",
      },
    },
    defaultVariants: {
      gap: "4",
      justify: "none",
      flex: "col",
    },
  }
);
export const designLabelVariants = cva("text-sm font-bold", {
  variants: {
    size: {
      sm: "text-sm",
    },
    bold: {
      true: "font-bold",
      false: "font-normal",
    },
    padding: {
      none: "",
      "2": "p-2",
    },
  },
  defaultVariants: {
    size: "sm",
    bold: true,
    padding: "2",
  },
});

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
