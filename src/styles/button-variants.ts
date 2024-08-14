import { cva } from "class-variance-authority";

export type IconSize = "3xl" | "2xl" | "xl" | "lg" | "md" | "sm" | "xs";
export const iconSizeConvertion = (size: IconSize) => {
  return size === "3xl"
    ? 30
    : size === "2xl"
    ? 24
    : size === "xl"
    ? 20
    : size === "lg"
    ? 18
    : size === "md"
    ? 16
    : size === "sm"
    ? 12
    : 8;
};

export const buttonCloseVariants = cva(
  ["z-auto border", "opacity-80 hover:opacity-100"],
  {
    variants: {
      size: {
        "3xl": "text-3xl",
        "2xl": "text-2xl",
        xl: "text-xl",
        lg: "text-lg",
        md: "text-md",
        sm: "text-sm",
        xs: "text-xs",
      },
      layout: {
        square: "rounded",
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      color: {
        red: "border-red-600 bg-red-600 text-white",
        darkred: "border-red-900 bg-red-900 text-white",
        blue: "border-blue-600 bg-blue-600 text-white",
        darkblue: "border-blue-900 bg-blue-900 text-white",
        green: "border-green-600 bg-green-600 text-white",
        transparent:
          "border-neutral-500 bg-transparent hover:border-neutral-900",
        none: "",
      },
    },
    defaultVariants: {
      size: "md",
      layout: "square",
      color: "none",
    },
  }
);

export const buttonMaximizeVariants = cva(
  ["z-auto border border-black text-white", "opacity-80 hover:opacity-100"],
  {
    variants: {
      size: {
        "3xl": "text-3xl",
        "2xl": "text-2xl",
        xl: "text-xl",
        lg: "text-lg",
        md: "text-md",
        sm: "text-sm",
        xs: "text-xs",
      },
      layout: {
        square: "rounded",
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      isMaximized: {
        true: "bg-green-600",
        false: "bg-blue-700",
      },
    },
    defaultVariants: {
      size: "md",
      isMaximized: false,
      layout: "square",
    },
  }
);

export const buttonMinimizeVariants = cva(
  [
    "z-auto rounded border border-black text-white",
    "opacity-80 hover:opacity-100",
  ],
  {
    variants: {
      size: {
        "3xl": "text-3xl",
        "2xl": "text-2xl",
        xl: "text-xl",
        lg: "text-lg",
        md: "text-md",
        sm: "text-sm",
        xs: "text-xs",
      },
      layout: {
        square: "rounded",
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      isMinimized: {
        true: "bg-green-600",
        false: "bg-blue-700",
      },
    },
    defaultVariants: {
      size: "md",
      isMinimized: false,
      layout: "square",
    },
  }
);
