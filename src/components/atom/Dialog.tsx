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
const useDialogContext = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContext.Provider not found");
  return context;
};

interface EventListenerProps {
  handler: (event: Event) => void;
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

const getFocusableElements = (ref: RefObject<HTMLElement>): HTMLElement[] => {
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
  onClick?: (e: MouseEvent) => void;
}

interface DialogTriggerProps extends DialogActionProps {
  type?: "open" | "close" | "toggle";
}

function isClickableElement(
  element: React.ReactNode
): element is React.ReactElement<ClickableProps> {
  return React.isValidElement(element);
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  className = null,
  type = "toggle",
  onClick,
}: DialogTriggerProps) => {
  const { blur, dialogRef } = useDialogContext();

  const handleClick = (e: MouseEvent) => {
    switch (type) {
      case "close":
        if (onClick) {
          onClick(e);
        }
        if (dialogRef.current) {
          dialogRef.current.close();
        }
        break;
      case "open":
        if (onClick) {
          onClick(e);
        }

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
        handleClick(e as unknown as MouseEvent);
        if (typeof children.props.onClick === "function") {
          children.props.onClick(e);
        }
      },
    })
  ) : (
    <button
      className={className || ""}
      onClick={(e) => handleClick(e as unknown as MouseEvent)}
    >
      {children}
    </button>
  );
};

export const DialogOpen: React.FC<DialogActionProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <DialogTrigger className={className} type="open" onClick={onClick}>
      {children}
    </DialogTrigger>
  );
};

export const DialogClose: React.FC<DialogActionProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <DialogTrigger className={className} type="close" onClick={onClick}>
      {children}
    </DialogTrigger>
  );
};

export const DialogToggle: React.FC<DialogActionProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <DialogTrigger className={className} type="toggle" onClick={onClick}>
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
  const ref = useRef<HTMLDivElement>(null);
  const isOpen = true;

  useEffect(() => {
    if (!dialogRef.current) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (dialogRef.current) {
          dialogRef.current.close();
          console.log("Escape & close");
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      console.log("handleClickOutside");
      const element: HTMLElement | null = ref.current;
      if (element && !element.contains(e.target as Node)) {
        if (dialogRef.current) {
          dialogRef.current.close();
          console.log("clic & close");
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (dialogRef.current && dialogRef.current === event.target) {
        dialogRef.current.close();
      }
    };

    if (isOpen && !blur) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
    }
    if (isOpen && blur) {
      dialogRef.current.addEventListener("mousedown", handleClick);
      dialogRef.current.addEventListener(
        "touchstart",
        handleClick as EventListener
      );
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
      dialogRef.current?.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, dialogRef, blur]);

  useFocusTrap(ref, isOpen);

  return (
    <>
      <div className="modal-backdrop"></div>

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
    </>
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
