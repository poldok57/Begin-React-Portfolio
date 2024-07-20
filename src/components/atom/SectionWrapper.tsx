import React from "react";
import { Typography } from "./Typography";

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
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  title,
}) => {
  return (
    <div className="flex flex-col items-center gap-12">
      <Typography variant="h2" id={title.toLowerCase().replaceAll(/\s/g, "-")}>
        {title}
      </Typography>
      {children}
    </div>
  );
};
