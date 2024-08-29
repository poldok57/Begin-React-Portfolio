import clsx from "clsx";
interface DeleteWithConfirmProps {
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export const DeleteWithConfirm: React.FC<DeleteWithConfirmProps> = ({
  className,
  position = "top",
  onConfirm,
  children = "Delete",
}) => {
  return (
    <>
      <div
        className={clsx("dropdown", {
          "dropdown-top": position === "top",
          "dropdown-bottom": position === "bottom",
          "dropdown-left": position === "left",
          "dropdown-right": position === "right",
        })}
      >
        <div tabIndex={0}>{children}</div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-fit p-2 shadow"
        >
          <li>
            <button className={className} onClick={onConfirm}>
              Confirm
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};
