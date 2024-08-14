import { cva } from "class-variance-authority";

export const taskbarContainerVariants = cva(
  ["fixed h-auto flex transition-all duration-300 ease-in-out"],
  {
    variants: {
      layout: {
        horizontal: "bottom-0 left-0 right-0 flex-row items-end w-fit",
        vertical:
          "bottom-0 flex-col-reverse justify-start items-start h-[80vh] mx-2",
        circular:
          "bottom-0 flex-col-reverse justify-end items-center mx-8 gap-4",
      },
      position: {
        left: "left-0",
        right: "right-0",
      },
      dynamic: {
        true: "group/dynamic -mb-4 pt-20 hover:mb-0 border border-transparent",
        false: "",
      },
    },
    compoundVariants: [
      {
        layout: "horizontal",
        position: "right",
        className: "ml-auto flex-row-reverse",
      },
      {
        dynamic: true,
        position: "left",
        className: "pr-8",
      },
      {
        dynamic: true,
        position: "right",
        className: "pl-8",
      },
    ],
    defaultVariants: {
      layout: "horizontal",
      position: "left",
      dynamic: true,
    },
  }
);

export const taskbarItemVariants = cva(
  [
    "cursor-pointer relative transition-all duration-200 ease-in-out items-center hover:scale-110",
    "bg-primary rounded border border-gray-500 text-secondary text-nowrap text-ellipsis overflow-hidden min-w-28",
  ],
  {
    variants: {
      layout: {
        horizontal: "h-10 px-2 flex",
        vertical: "w-full py-2 px-4",
        circular:
          "flex flex-col rounded-full opacity-20 hover:opacity-90 hover:border-2 hover:bg-opacity-60 px-2 py-12 text-center justify-center",
      },
      dynamic: {
        true: "hover:h-auto -mb-20 group-hover/dynamic:mb-0 hover:font-bold",
        false: "",
      },
      overflow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        dynamic: true,
        layout: "circular",
        className: "-mb-28",
      },
      {
        overflow: true,
        layout: "circular",
        className: "overflow-visible",
      },
    ],
    defaultVariants: {
      layout: "horizontal",
    },
  }
);

export const selectBoxVariants = cva(
  "block px-1 py-2 mt-1 w-full text-base rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
);
