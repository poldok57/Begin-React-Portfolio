import React from "react";

interface SettingsOffProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const SettingsOff: React.FC<SettingsOffProps> = ({
  className = "",
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-settings ${className}`}
    >
      <path
        d="M 6 6 a 2 2 0 0 0 -2.73 0.73 l -0.22 0.38 a 2 2 0 0 0 0.73 2.73 l 0.15 0.1 a 2 2 0 0 1 1 1.72 v 0.51 a 2 2 0 0 1 -1 1.74 l -0.15 0.09 a 2 2 0 0 0 -0.73 2.73 l 0.22 0.38 a 2 2 0 0 0 2.73 0.73 l 0.15 -0.08 a 2 2 0 0 1 2 0 l 0.43 0.25 a 2 2 0 0 1 1 1.73 V 20 a 2 2 0 0 0 2 2 h 0.44 a 2 2 0 0 0 2 -2 v -0.18 a 2 2 0 0 1 1 -1.73 l 0.43 -0.25 a 2 2 0 0 1 2 0 l 0.15 0.08 
      M 20.75 16.8 a 2 2 0 0 0 -0.73 -2.73 l -0.15 -0.08 a 2 2 0 0 1 -1 -1.74 v -0.5 a 2 2 0 0 1 1 -1.74 l 0.15 -0.09 a 2 2 0 0 0 0.73 -2.73 l -0.22 -0.38 a 2 2 0 0 0 -2.73 -0.73 l -0.15 0.08 a 2 2 0 0 1 -2 0 l -0.43 -0.25 a 2 2 0 0 1 -1 -1.73 v -0.18 A 2 2 0 0 0 12.22 2 h 0 h -0.44 a 2 2 0 0 0 -2 2 v 0.18 A 2 2 0 0 1 9.27 5.27"
      />
      <circle cx="12" cy="12" r="3" />
      <path d="m 2 2 L 22 22" />
    </svg>
  );
};

export default SettingsOff;
