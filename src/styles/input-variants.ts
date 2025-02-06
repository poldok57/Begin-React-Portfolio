//  import clsx from "clsx";
import { cva } from "class-variance-authority";

export const inputRangeVariants = cva(
  "transition-opacity bg-gray-200 opacity-70 range hover:opacity-100",
  {
    variants: {
      width: {
        "8": "w-8",
        "10": "w-10",
        "12": "w-12",
        "14": "w-14",
        "16": "w-16",
        "18": "w-18",
        "20": "w-20",
        "24": "w-24",
        "28": "w-28",
        "32": "w-32",
      },
      size: {
        xs: "range-xs",
        sm: "range-sm",
        md: "range-md",
        lg: "range-lg",
      },
      style: {
        primary: "range-primary",
        secondary: "range-secondary",
        success: "range-success",
        warning: "range-warning",
        danger: "range-danger",
        none: "",
      },
      margin: {
        "1": "my-1",
        "2": "my-2",
        "3": "my-3",
        "4": "my-4",
        "5": "my-5",
      },
    },
    defaultVariants: {
      width: "14",
      size: "md",
      style: "primary",
      margin: "1",
    },
  }
);
export const inputSelectVariants = cva(
  [
    "transition-opacity opacity-70& hover:opacity-100",
    "px-1 py-2 rounded-md border-2 cursor-pointer border-primary",
  ],
  {
    variants: {
      width: {
        "8": "w-8",
        "10": "w-10",
        "12": "w-12",
        "14": "w-14",
        "16": "w-16",
        "18": "w-18",
        "20": "w-20",
        "24": "w-24",
        "28": "w-28",
        "32": "w-32",
      },
      appearance: {
        none: "appearance-none",
        default: "",
      },
      bg: {
        none: "",
        paper: "bg-paper",
        primary: "bg-primary",
        secondary: "bg-secondary",
        success: "bg-success",
        warning: "bg-warning",
      },
      focus: {
        none: "",
        blue: "focus:ring-blue-500",
        primary: "focus:ring-primary",
        secondary: "focus:ring-secondary",
        success: "focus:ring-success",
        warning: "focus:ring-warning",
      },
    },
    defaultVariants: {
      width: "14",
      appearance: "none",
      bg: "paper",
      focus: "blue",
    },
  }
);
