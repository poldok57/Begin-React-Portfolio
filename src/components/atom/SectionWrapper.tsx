import React from "react";
import { Typography } from "./Typography";
import clsx from "clsx";

/**
 * Wrapper for all section, with the title and layout.
 *
 * @param children Children of the section
 * @param title Title of the section
 * @returns {JSX.Element}
 * @constructor
 */
interface SectionWrapperProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  title,
  className,
}) => {
  return (
    <div className={clsx("flex flex-col gap-12 items-center", className)}>
      <Typography variant="h2" key={title.toLowerCase().replaceAll(/\s/g, "-")}>
        {title}
      </Typography>
      {children}
    </div>
  );
};
