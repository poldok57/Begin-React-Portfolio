import clsx from "clsx";
interface DeleteWithConfirmProps {
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  onConfirm?: () => void;
  children?: React.ReactNode;
  confirmMessage?: string;
}

export const DeleteWithConfirm: React.FC<DeleteWithConfirmProps> = ({
  className,
  position = "top",
  onConfirm,
  children = "Delete",
  confirmMessage = "Confirm delete?",
}) => {
  return (
    <>
      <div
        className={clsx("dropdown z-10", {
          "dropdown-top": position === "top",
          "dropdown-bottom": position === "bottom",
          "dropdown-left": position === "left",
          "dropdown-right": position === "right",
        })}
      >
        <div tabIndex={0}>{children}</div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-fit min-w-40 p-2 text-nowrap shadow"
        >
          <li className="z-40 p-1 text-nowrap">
            <button className={className} onClick={onConfirm}>
              {confirmMessage}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};
