// import React, { useEffect, useState } from 'react';
import styled, { keyframes } from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import { SVGProps } from "react";
import { TableProps } from "./types";

// Animation flash
const flashAnimation = keyframes`
  0%, 100% { fill-opacity: 1; }
  50% { fill-opacity: 0.5; }
`;

interface SvgWrapperProps extends SVGProps<SVGSVGElement> {
  rotation: number;
  flash: boolean;
  flashDuration: number;
}

const SvgWrapper = styled.svg<SvgWrapperProps>`
  transform: rotate(${(props) => props.rotation}deg);
  animation: ${(props) =>
    props.flash
      ? `${flashAnimation} ${props.flashDuration}s infinite`
      : "none"};
`;

export const PokerTable: React.FC<TableProps> = ({
  size = 300,
  rotation = 0,
  borderColor = "black",
  fillColor = "green",
  tableNumber = "1",
  tableText = "Table",
  numberColor = "white",
  textColor = "white",
  flashDuration = 0,
  widthLine = 0.025,
  heightRatio = 0.28,
  concaveRatio = 0.07,
  textRatio = 0.3,
  textPosition = 0,
  opacity = 0.4,
}) => {
  const flash = flashDuration > 0;
  const strokeWidth = size * widthLine;
  const textSize = size * textRatio;
  const subTextSize = textSize * 0.25;

  // Dimensions de la table
  const radius = size * heightRatio;
  const longSide = size - 2 * (strokeWidth + radius);
  const concaveRadius = size * concaveRatio; // rayon des quarts de cercle concaves pour le croupier

  const concaveRadiusY = (concaveRadius * 2) / 3;
  const cashierWidth = Math.min(
    Math.max(longSide - concaveRadius * 3, size * 0.2),
    radius
  );
  const cashierHeight = cashierWidth * 0.5;
  const textRef = useRef<SVGTextElement>(null);
  const [adjustedFontSize, setAdjustedFontSize] = useState(subTextSize);

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      if (bbox.width > longSide * 1.1) {
        const scaleFactor = longSide / bbox.width;
        setAdjustedFontSize(subTextSize * scaleFactor);
      } else {
        setAdjustedFontSize(subTextSize);
      }
    }
  }, [tableText, subTextSize, strokeWidth, longSide]);

  return (
    <SvgWrapper
      width={size}
      height={(radius + strokeWidth) * 2}
      viewBox={`0 0 ${size} ${radius * 2 + strokeWidth}`}
      rotation={rotation}
      flash={flash}
      flashDuration={flashDuration}
    >
      <path
        d={
          `
          M ${strokeWidth + radius},${radius * 2 + strokeWidth} 
        a ${radius},${radius} 0 0,1 0,${-radius * 2}` +
          `h ${longSide}` +
          `a ${radius},${radius} 0 0,1 0,${radius * 2}` +
          `h ${(-concaveRadius * 3) / 4}` +
          `a ${concaveRadius},${concaveRadiusY} 0 0,0 ${-concaveRadius},${-concaveRadiusY}` +
          `h ${-longSide + concaveRadius * 3.5}` +
          `a ${concaveRadius},${concaveRadiusY} 0 0,0 ${-concaveRadius},${concaveRadiusY}` +
          `z`
        }
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={strokeWidth}
      />
      {/* Rectangle de la caisse du croupier */}
      <rect
        x={(size - cashierWidth) / 2}
        y={radius * 2 - concaveRadiusY - cashierHeight}
        width={cashierWidth}
        height={cashierHeight}
        fill={borderColor}
        opacity={opacity}
      />
      {/* Numéro de la table */}
      <text
        x="50%"
        y={
          2 * radius -
          concaveRadiusY -
          textSize / 3 +
          Math.min(-cashierHeight + textPosition * radius, 0)
        }
        fontSize={textSize}
        fill={numberColor}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {tableNumber}
      </text>
      {/* Texte supplémentaire */}
      {subTextSize > 9 && (
        <text
          ref={textRef}
          x="50%"
          y={adjustedFontSize + strokeWidth}
          fontSize={adjustedFontSize}
          fill={textColor}
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {tableText}
        </text>
      )}
    </SvgWrapper>
  );
};

export default PokerTable;