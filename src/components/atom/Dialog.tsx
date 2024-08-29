"use client";
import React, {
  useRef,
  useEffect,
  useContext,
  createContext,
  cloneElement,
  RefObject,
} from "react";
import clsx from "clsx";

type DialogContextType = {
  blur: boolean | null;
  dialogRef: RefObject<HTMLDialogElement>;
};

const DialogContext = createContext<DialogContextType | null>(null);
const useDialogContext: () => DialogContextType = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContext.Provider not found");
  // ✅ Sinon on va renvoyer le contexte
  return context;
};

interface EventListenerProps {
  handler: (event: Event | KeyboardEvent | MouseEvent) => void;
  isEnabled?: boolean;
  type: string;
  element?: Window | Document | HTMLElement;
}
const useEventListener = ({
  handler,
  isEnabled = true,
  type,
  element = window,
}: EventListenerProps): void => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isEnabled || !element) {
      return;
    }

    const onEvent = (e: Event) => {
      handlerRef.current(e);
    };

    element.addEventListener(type, onEvent);

    return () => {
      element.removeEventListener(type, onEvent);
    };
  }, [isEnabled, type, element]);
};

const getFocusableElements = (ref: RefObject<HTMLElement>) => {
  if (!ref.current) return [];
  return Array.from(
    ref.current.querySelectorAll("a[href], button, textarea, input, select")
  ) as HTMLElement[];
};

const useFocusTrap = (ref: RefObject<HTMLElement>, isEnabled: boolean) => {
  useEventListener({
    type: "keydown",
    isEnabled,
    handler: (event: Event) => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Tab") return;

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

interface DialogProps {
  children: React.ReactNode;
  blur?: boolean | null;
}
export const Dialog: React.FC<DialogProps> = ({ children, blur = null }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <DialogContext.Provider value={{ blur, dialogRef }}>
      {children}
    </DialogContext.Provider>
  );
};
type ClickableProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

interface DialogActionProps {
  children: React.ReactElement | string;
  className?: string | null;
}

interface DialogTriggerProps extends DialogActionProps {
  type?: "open" | "close" | "toggle";
}

function isClickableElement(
  element: React.ReactNode
): element is React.ReactElement<ClickableProps> {
  return React.isValidElement(element); //&& typeof element.props.onClick === "function"
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  className = null,
  type = "toggle",
}: DialogTriggerProps) => {
  const { blur, dialogRef } = useDialogContext();

  const handleClick = () => {
    switch (type) {
      case "close":
        if (dialogRef.current) {
          dialogRef.current.close();
        }
        break;
      case "open":
        if (dialogRef.current) {
          if (blur) {
            dialogRef.current.showModal();
          } else {
            dialogRef.current.show();
          }
        }
        break;
      default: // toggle
        if (dialogRef.current) {
          if (dialogRef.current.open) {
            dialogRef.current.close();
          } else {
            if (blur) {
              dialogRef.current.showModal();
            } else {
              dialogRef.current.show();
            }
          }
        }
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
    <button className={className || ""} onClick={() => handleClick()}>
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
  const { blur, dialogRef } = useDialogContext();
  const ref = useRef(null);
  const open = true; //dialogRef.current?.open;

  const handleClickOutside = (e: Event) => {
    if (!(e instanceof MouseEvent)) return;
    const element: HTMLElement | null = ref.current as HTMLElement | null;
    if (element && !element.contains(e.target as Node)) {
      if (dialogRef.current) {
        dialogRef.current.close();
      }
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
    handler: (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        if (dialogRef.current) {
          dialogRef.current.close();
        }
      }
    },
  });

  useFocusTrap(ref, open || false);

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
        <div ref={ref} className="card">
          {children}
        </div>
      ) : (
        <div ref={ref} className="card card-body">
          {children}
        </div>
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
