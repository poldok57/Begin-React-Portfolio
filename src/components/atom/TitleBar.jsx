import React, { forwardRef } from "react";
import clsx from "clsx";
/**
 * TitleBar component
 * @param {object} props
 * @param {string} props.className - class name of the component
 * @param {object} props.children - children to render
 */
export const TitleBar = forwardRef(function TitleBar(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
});
