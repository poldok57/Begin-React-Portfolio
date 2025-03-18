import React, { useState } from "react";

interface DeleteWithConfirmProps {
  onConfirm: () => void;
  children: React.ReactNode;
  btnSize?: number;
  className?: string;
}

export const DeleteWithConfirm: React.FC<DeleteWithConfirmProps> = ({
  onConfirm,
  children,
  className = "btn btn-square btn-ghost",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (showConfirm) {
      onConfirm();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className={`${className} ${showConfirm ? "btn-error" : ""}`}
      >
        {children}
      </button>
      {showConfirm && (
        <div className="absolute right-0 top-full z-10 p-2 mt-2 rounded shadow-lg bg-base-200">
          <p className="mb-2 text-sm">Confirmer la suppression ?</p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="btn btn-ghost btn-sm"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                setShowConfirm(false);
              }}
              className="btn btn-error btn-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
