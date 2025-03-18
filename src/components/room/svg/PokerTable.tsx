import React, { useEffect, useRef, useState } from "react";
import { TableProps } from "../types";
import { SvgWrapper, useAnimation } from "./SvgWrapper";

const MemorizedPokerTable = React.memo(
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
    flashDelay = 0,
    widthLine = 0.025,
    heightRatio = 0.28,
    concaveRatio = 0.07,
    textRatio = 0.3,
    opacity = 0.4,
    style,
    onClick,
  }: TableProps) => {
    const strokeWidth = size * widthLine;
    const textSize = size * textRatio;
    const subTextSize = textSize * 0.25;

    // Dimensions de la table
    const radius = parseFloat(
      (size * heightRatio - strokeWidth / 2).toFixed(2)
    );
    const longSide = parseFloat((size - strokeWidth - 2 * radius).toFixed(2));
    const concaveRadius = parseFloat((size * concaveRatio).toFixed(2)); // rayon des quarts de cercle concaves pour le croupier

    const concaveRadiusY = Math.round((concaveRadius * 2) / 3);
    const concaveLarge = Math.round(
      Math.max(longSide - concaveRadius * 3.5, size * 0.1)
    );
    const concaveSide = Math.round(
      (longSide - concaveLarge) / 2 - concaveRadius
    );

    const cashierWidth = Math.round(
      Math.min(Math.max(longSide - concaveRadius * 3, size * 0.2), radius)
    );
    const cashierHeight = Math.round(cashierWidth * 0.5);
    const textRef = useRef<SVGTextElement>(null);
    const [adjustedFontSize, setAdjustedFontSize] = useState(subTextSize);
    const [animationkey, setAnimationKey] = useState(flashDuration > 0 ? 1 : 0);

    useAnimation({
      flashDuration,
      flashDelay,
      borderColor,
      fillColor,
      animationkey,
      setAnimationKey,
    });

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
        height={radius * 2 + strokeWidth}
        viewBox={`0 0 ${size} ${radius * 2 + strokeWidth}`}
        $rotation={rotation}
        $animationkey={animationkey}
        style={style}
        onClick={onClick}
      >
        <path
          d={
            `
          M ${strokeWidth / 2 + radius},${radius * 2 + strokeWidth / 2} 
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
          y={radius * 1.95 - concaveRadiusY - cashierHeight}
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
            y={"59%"}
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
                  ? strokeWidth
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

MemorizedPokerTable.displayName = "PokerTable";

export const PokerTable = MemorizedPokerTable;

export default PokerTable;
