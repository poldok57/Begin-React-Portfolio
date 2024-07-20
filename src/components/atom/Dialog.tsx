"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  createContext,
  cloneElement,
  RefObject,
} from "react";
import clsx from "clsx";

type DialogContextType = {
  open: boolean;
  blur: boolean;
  dialogRef: RefObject<HTMLDialogElement>;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext(null);
const useDialogContext: () => DialogContextType = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContext.Provider not found");
  // ✅ Sinon on va renvoyer le contexte
  return context;
};
const useEventListener = ({
  handler,
  isEnabled = true,
  type,
  element = window,
}) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    if (!element) {
      return;
    }

    const onEvent = (e) => {
      handlerRef.current(e);
    };

    element.addEventListener(type, onEvent);

    return () => {
      element.removeEventListener(type, onEvent);
    };
  }, [isEnabled, type, element]);
};

const getFocusableElements = (ref: RefObject<HTMLElement>) =>
  Array.from(
    ref.current.querySelectorAll("a[href], button, textarea, input, select")
  ) as HTMLElement[];

const useFocusTrap = (ref: RefObject<HTMLElement>, isEnabled: boolean) => {
  useEventListener({
    type: "keydown",
    isEnabled,
    handler: (event) => {
      if (event.key !== "Tab") return;

      const focusableElements: HTMLElement[] = getFocusableElements(ref);

      const activeElement: HTMLElement = document.activeElement as HTMLElement;

      let nextIndex = event.shiftKey
        ? focusableElements.indexOf(activeElement) - 1
        : focusableElements.indexOf(activeElement) + 1;

      const toFocusElement = focusableElements[nextIndex];

      if (toFocusElement) {
        // let's DOM handle the focus
        return;
      }
      // element outside the dialog let's loop on Dialog's focusable elements
      nextIndex = nextIndex < 0 ? focusableElements.length - 1 : 0;

      focusableElements[nextIndex].focus();
      event.preventDefault();
      return;
    },
  });
};

export const Dialog = ({ children, blur = null }) => {
  const [open, setOpen] = useState<boolean>(false);
  const dialogRef = useRef(null);

  return (
    <DialogContext.Provider value={{ open, blur, dialogRef, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};
type ClickableProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

interface DialogActionProps {
  children: React.ReactElement | string;
  className?: string | undefined;
}

interface DialogTriggerProps extends DialogActionProps {
  type?: "open" | "close" | "toggle";
}

function isClickableElement(
  element: any
): element is React.ReactElement<ClickableProps> {
  return React.isValidElement(element); //&& typeof element.props.onClick === "function"
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  className = undefined,
  type = "toggle",
}: DialogTriggerProps) => {
  const { setOpen, blur, dialogRef } = useDialogContext();

  const handleClick = () => {
    switch (type) {
      case "close":
        if (dialogRef.current) {
          dialogRef.current.close();
        }
        setOpen(false);
        break;
      case "open":
        if (dialogRef.current) {
          if (blur) {
            dialogRef.current.showModal();
          } else {
            dialogRef.current.show();
          }
        }
        setOpen(true);
        break;
      default: // toggle
        setOpen((curr) => !curr);
        break;
    }
  };

  return isClickableElement(children) && children.props.onClick ? (
    cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick();
        if (typeof children.props.onClick === "function") {
          children.props.onClick(e);
        }
      },
    })
  ) : (
    <button className={className} onClick={() => handleClick()}>
      {children}
    </button>
  );
};

// DialogOpen: Fonction pour ouvrir la boîte de dialogue
export const DialogOpen: React.FC<DialogActionProps> = ({
  children,
  className,
}) => {
  return (
    <DialogTrigger className={className} type="open">
      {children}
    </DialogTrigger>
  );
};

// DialogClose: Fonction pour fermer la boîte de dialogue
export const DialogClose: React.FC<DialogActionProps> = ({
  children,
  className,
}) => {
  return (
    <DialogTrigger className={className} type="close">
      {children}
    </DialogTrigger>
  );
};

// DialogToggle: Fonction pour basculer l'état de la boîte de dialogue
export const DialogToggle: React.FC<DialogActionProps> = ({
  children,
  className,
}) => {
  return (
    <DialogTrigger className={className} type="toggle">
      {children}
    </DialogTrigger>
  );
};

interface DialogContentProps {
  className?: string | null;
  children: React.ReactNode;
  position?: "modal" | "over" | "under";
}

export const DialogContent: React.FC<DialogContentProps> = ({
  className = null,
  children,
  position = "modal",
}) => {
  const { open, blur, dialogRef, setOpen } = useDialogContext();
  const ref = useRef(null);

  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEventListener({
    isEnabled: open,
    type: "mousedown",
    handler: handleClickOutside,
  });

  useEventListener({
    isEnabled: open,
    type: "touchstart",
    handler: handleClickOutside,
  });

  useEventListener({
    isEnabled: open,
    type: "keydown",
    handler: (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
  });

  useFocusTrap(ref, open);

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        "shadow-xl animate-in fade-in-50",
        {
          "relative -translate-y-full": position === "over",
          relative: position === "under",
          modal: blur,
        },
        className
      )}
    >
      {className ? (
        <div className="card">{children}</div>
      ) : (
        <div className="card card-body">{children}</div>
      )}
    </dialog>
  );
};

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  className = null,
  children,
}) => {
  return <div className={clsx("card-actions", className)}>{children}</div>;
};
