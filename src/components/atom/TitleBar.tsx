import React, { forwardRef, ReactNode } from "react";
import clsx from "clsx";

interface TitleBarProps {
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export const TitleBar = forwardRef<HTMLDivElement, TitleBarProps>(
  function TitleBar({ children = null, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("flex items-center justify-center", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
