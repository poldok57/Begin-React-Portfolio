import React, { useEffect, useRef, useState } from "react";
import { TableProps } from "../types";

import { SvgWrapper, useAnimation } from "./SvgWrapper";

const MemorizedBlackJackTable = React.memo(
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
    heightRatio = 0.34,
    concaveRatio = 0.07,
    textRatio = 0.3,
    opacity = 0.4,
    style,
  }: TableProps) => {
    const strokeWidth = Math.round(size * widthLine);
    const textSize = size * textRatio;
    const subTextSize = textSize * 0.25;

    // Dimensions de la table
    const radius = parseFloat(((size - strokeWidth) / 2).toFixed(2));
    const radiusY = parseFloat((radius * (0.3 + 2 * heightRatio)).toFixed(2));
    const cornerRadius = Math.round(size * 0.2 * heightRatio);

    const longSide = Math.round(size - strokeWidth - 2 * +cornerRadius);
    const concaveRadius = Math.round(size * concaveRatio); // rayon des quarts de cercle concaves pour le croupier

    const concaveRadiusY = Math.round((concaveRadius * 2) / 3);
    const concaveLarge = Math.round(
      Math.max(longSide * 0.6 - concaveRadius * 3.5, size * 0.1)
    );
    const concaveSide = (longSide - concaveLarge) / 2 - concaveRadius;
    const bottomTable = radiusY + cornerRadius;

    const cashierWidth = Math.round(
      Math.min(Math.max(concaveLarge, size * 0.2), radius / 2)
    );
    const cashierHeight = Math.round(cashierWidth * 0.4);
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
        height={bottomTable + strokeWidth}
        viewBox={`0 0 ${size} ${bottomTable}`}
        $rotation={rotation}
        $animationkey={animationkey}
        style={style}
      >
        <path
          d={
            `
          M ${cornerRadius + strokeWidth / 2},${bottomTable} 
          a ${cornerRadius},${cornerRadius} 0 0,1 ${-cornerRadius},${-cornerRadius}` +
            `a ${radius},${radiusY} 0 0,1 ${2 * radius},0` +
            `a ${cornerRadius},${cornerRadius} 0 0,1 ${-cornerRadius},${cornerRadius}` +
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
        {/* vertical symmetry line */}
        <line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={bottomTable}
          stroke={textColor}
          strokeWidth="1"
          strokeDasharray="20,5,4,3"
          opacity={0.5}
        />

        {/* Rectangle for cashier */}
        <rect
          x={(size - cashierWidth) / 2}
          y={
            radiusY * 0.95 +
            cornerRadius -
            concaveRadiusY -
            cashierHeight -
            strokeWidth / 2
          }
          width={cashierWidth}
          height={cashierHeight}
          fill={borderColor}
          opacity={opacity}
        />
        {/* Table number */}
        <g
          transform={`rotate(${-rotation}, ${size / 2}, ${
            (bottomTable + strokeWidth) / 2
          })`}
        >
          <text
            x="50%"
            y={rotation > 130 && rotation < 230 ? "70%" : "60%"}
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
                  ? strokeWidth * 0.4
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

MemorizedBlackJackTable.displayName = "BlackJackTable";

export const BlackJackTable = MemorizedBlackJackTable;

export default BlackJackTable;
