import clsx from "clsx";
interface DeleteWithConfirmProps {
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "end";
  onConfirm?: () => void;
  children?: React.ReactNode;
  confirmMessage?: string;
  confirmClassName?: string;
}

export const DeleteWithConfirm: React.FC<DeleteWithConfirmProps> = ({
  className,
  position = "top",
  align = "start",
  onConfirm,
  children = "Delete",
  confirmClassName,
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
          "dropdown-end": align === "end",
        })}
      >
        <details>
          <summary tabIndex={0} className={className} role="button">
            {children}
          </summary>
          <ul
            // tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-fit p-1 text-nowrap shadow"
          >
            <li className="z-40 p-1 text-nowrap">
              <button className={confirmClassName} onClick={onConfirm}>
                {confirmMessage}
              </button>
            </li>
          </ul>
        </details>
      </div>
    </>
  );
};
