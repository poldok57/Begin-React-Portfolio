import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
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

const MemoizedPokerTable = React.memo(
  ({
    size = 300,
    rotation = 0,
    borderColor = "#404040",
    fillColor = "#aaaaaa",
    tableNumber = "1",
    tableText = "Table",
    numberColor = "white",
    textColor = "white",
    flashDuration = 0,
    widthLine = 0.025,
    heightRatio = 0.28,
    concaveRatio = 0.07,
    textRatio = 0.3,
    opacity = 0.4,
  }: TableProps) => {
    const flash = flashDuration > 0;
    const strokeWidth = size * widthLine;
    const textSize = size * textRatio;
    const subTextSize = textSize * 0.25;

    // Dimensions de la table
    const radius = size * heightRatio - strokeWidth;
    const longSide = size - 2 * (strokeWidth + radius);
    const concaveRadius = size * concaveRatio; // rayon des quarts de cercle concaves pour le croupier

    const concaveRadiusY = (concaveRadius * 2) / 3;
    const concaveLarge = Math.max(longSide - concaveRadius * 3.5, size * 0.1);
    const concaveSide = (longSide - concaveLarge) / 2 - concaveRadius;

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
    }, [tableText, subTextSize, strokeWidth, size, longSide]);

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
            `h ${-concaveSide}` +
            `a ${concaveRadius},${concaveRadiusY} 0 0,0 ${-concaveRadius},${-concaveRadiusY}` +
            `h ${-concaveLarge}` +
            `a ${concaveRadius},${concaveRadiusY} 0 0,0 ${-concaveRadius},${concaveRadiusY}` +
            `z`
          }
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Rectangle for cashier */}
        <rect
          x={(size - cashierWidth) / 2}
          y={radius * 2 - concaveRadiusY - cashierHeight}
          width={cashierWidth}
          height={cashierHeight}
          fill={borderColor}
          opacity={opacity}
        />
        {/* Table number */}
        <g
          transform={`rotate(${-rotation}, ${size / 2}, ${
            radius + strokeWidth
          })`}
        >
          <text
            x="50%"
            y={"60%"}
            fontSize={textSize}
            fill={numberColor}
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {tableNumber}
          </text>
          {/* Groupe name */}
          {subTextSize > 9 && (
            <text
              ref={textRef}
              x="50%"
              y={
                adjustedFontSize +
                (rotation > 130 && rotation < 230
                  ? concaveRadiusY + strokeWidth * 0.5
                  : rotation >= 325 || rotation <= 30
                  ? strokeWidth * 1.25
                  : 0)
              }
              fontSize={adjustedFontSize}
              fill={textColor}
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {tableText}
            </text>
          )}
        </g>
      </SvgWrapper>
    );
  },
  (prevProps, nextProps) => {
    // Compare the properties that could affect the rendering
    return (
      prevProps.size === nextProps.size &&
      prevProps.rotation === nextProps.rotation &&
      prevProps.borderColor === nextProps.borderColor &&
      prevProps.fillColor === nextProps.fillColor &&
      prevProps.tableNumber === nextProps.tableNumber &&
      prevProps.tableText === nextProps.tableText &&
      prevProps.numberColor === nextProps.numberColor &&
      prevProps.textColor === nextProps.textColor &&
      prevProps.flashDuration === nextProps.flashDuration &&
      prevProps.widthLine === nextProps.widthLine &&
      prevProps.heightRatio === nextProps.heightRatio &&
      prevProps.concaveRatio === nextProps.concaveRatio &&
      prevProps.textRatio === nextProps.textRatio &&
      prevProps.opacity === nextProps.opacity
    );
  }
);

MemoizedPokerTable.displayName = "PokerTable";

export const PokerTable = MemoizedPokerTable;

export default PokerTable;
