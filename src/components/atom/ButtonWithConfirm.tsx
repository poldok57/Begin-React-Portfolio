import { ComponentType } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./Dialog";
import { X, MessageSquareOff } from "lucide-react";

interface ButtonWithConfirmProps {
  btnSize: number;
  className?: string;
  IconAction?: ComponentType<{ size: number }>;
  IconCancel?: ComponentType<{ size: number }>;
  onConfirm?: () => void;
}

export const ButtonWithConfirm: React.FC<ButtonWithConfirmProps> = ({
  btnSize,
  className,
  onConfirm,
  IconAction = X,
  IconCancel = MessageSquareOff,
}) => {
  return (
    <Dialog blur={false}>
      <div className="flex relative">
        <DialogTrigger type="open" className={className}>
          <IconAction size={btnSize} />
        </DialogTrigger>
        <DialogContent
          position="over"
          className="relative gap-1 p-1 m-1 rounded border group/dialog border-base-300 bg-base-200"
        >
          <button className={className} onClick={onConfirm}>
            <IconAction size={btnSize} />
          </button>
          <DialogTrigger type="close" className={className}>
            <IconCancel size={btnSize} />
          </DialogTrigger>
        </DialogContent>
      </div>
    </Dialog>
  );
};
