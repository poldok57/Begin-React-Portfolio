import React, { useEffect, useRef, useState } from "react";
import { TableProps, TableType } from "../types";

import { SvgWrapper, useAnimation } from "./SvgWrapper";

const MemorizedSymetricTable = React.memo(
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
    concaveRatio = 0.05,
    textRatio = 0.3,
    opacity = 0.25,
    style,
    type,
  }: TableProps) => {
    const strokeWidth = size * widthLine;
    const textSize = size * textRatio;
    const subTextSize = textSize * 0.25;

    // Table dimensions
    const radius = parseFloat(((size - strokeWidth) / 2).toFixed(2));
    const radiusY = parseFloat((radius * (0.3 + 2 * heightRatio)).toFixed(2));
    const cornerRadius = Math.round(size * 0.2 * heightRatio);

    const longSide = Math.round(size - strokeWidth - 2 * +cornerRadius);
    const concaveRadius = Math.round(size * concaveRatio); // rayon des quarts de cercle concaves pour le croupier

    const concaveRadiusY = Math.round((concaveRadius * 2) / 3);
    const concaveLarge = Math.round(
      Math.max(longSide * 0.6 - concaveRadius * 3.5, size * 0.1)
    );
    const concaveSide = Math.round(
      (longSide - concaveLarge) / 2 - concaveRadius
    );
    const bottomTable =
      type !== TableType.other
        ? Math.round(radiusY + cornerRadius)
        : 2 * (radiusY + strokeWidth);

    const textY =
      type === TableType.other
        ? "50%"
        : rotation > 130 && rotation < 230
        ? "70%"
        : "60%";

    const cashierWidth = Math.round(
      Math.min(Math.max(concaveLarge, size * 0.2), radius / 2)
    );
    const cashierHeight = Math.round(cashierWidth * 0.4);

    const heightCraps = Math.round(radiusY - cornerRadius);
    const heightCarpetCraps = Math.round(
      heightCraps - strokeWidth - concaveRadiusY
    );
    const widthCarpetCraps = Math.round(radius - cashierWidth * 0.8);

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
        {type === TableType.craps && (
          <>
            <path
              d={
                `
          M ${cornerRadius + strokeWidth / 2},${bottomTable} 
          a ${cornerRadius},${cornerRadius} 0 0,1 ${-cornerRadius},${-cornerRadius}` +
                `v ${-heightCraps}` +
                `a ${cornerRadius},${cornerRadius} 0 0,1 ${cornerRadius},${-cornerRadius}` +
                `h ${longSide}` +
                `a ${cornerRadius},${cornerRadius} 0 0,1 ${cornerRadius},${cornerRadius}` +
                `v ${heightCraps}` +
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
            {/* Carpet for craps game */}
            <path
              d={
                `M ${(size - cashierWidth) / 2},${
                  bottomTable - concaveRadius - strokeWidth / 2
                } ` +
                `h ${-widthCarpetCraps}` +
                `v ${-heightCarpetCraps}` +
                `a ${cashierHeight * 0.5},${cashierHeight * 0.5} 0 0,1 ${
                  cashierHeight * 0.5
                },${-cashierHeight * 0.5}` +
                `h ${widthCarpetCraps * 0.8 - cashierHeight * 0.5}` +
                `v ${heightCarpetCraps - cashierHeight * 0.5}` +
                `h ${widthCarpetCraps * 0.2}` +
                `z` +
                `M ${(size + cashierWidth) / 2},${
                  bottomTable - concaveRadius - strokeWidth / 2
                } ` +
                `h ${widthCarpetCraps}` +
                `v ${-heightCarpetCraps}` +
                `a ${cashierHeight * 0.5},${cashierHeight * 0.5} 0 0,0 ${
                  -cashierHeight * 0.5
                },${-cashierHeight * 0.5}` +
                `h ${-widthCarpetCraps * 0.8 + cashierHeight * 0.5}` +
                `v ${heightCarpetCraps - cashierHeight * 0.5}` +
                `h ${-widthCarpetCraps * 0.2}` +
                `z` +
                `M ${(size - cashierWidth) / 2},${1.2 * strokeWidth}` +
                `h ${cashierWidth}` +
                `v ${heightCarpetCraps * 0.75}` +
                `a ${cashierHeight * 0.5},${cashierHeight * 0.5} 0 0,1 ${
                  -cashierHeight * 0.5
                },${cashierHeight * 0.5}` +
                `h ${-cashierWidth + cashierHeight}` +
                `a ${cashierHeight * 0.5},${cashierHeight * 0.5} 0 0,1 ${
                  -cashierHeight * 0.5
                },${-cashierHeight * 0.5}` +
                `z`
              }
              fill={borderColor}
              stroke="#d0d4d4"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={opacity}
            />
          </>
        )}
        {type === TableType.blackjack && (
          <>
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
          </>
        )}
        {type === TableType.other && (
          <>
            <path
              d={
                `
                  M ${strokeWidth / 2},${bottomTable / 2} ` +
                `a ${radius},${radiusY} 0 0,1 ${2 * radius},0` +
                `a ${radius},${radiusY} 0 0,1 ${-2 * radius},0` +
                `z`
              }
              fill={fillColor}
              stroke={borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray="5,5"
              opacity={0.2}
            />
            <circle
              cx={size / 2}
              cy={bottomTable / 2}
              r={size * concaveRatio * 2}
              fill={borderColor}
              stroke="#d0d4d4"
              strokeWidth="2"
              opacity={opacity}
            />
          </>
        )}
        {/* vertical symmetry line 
        <line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={bottomTable}
          stroke={textColor}
          strokeWidth="1"
          strokeDasharray="20,5,4,3"
          opacity={0.5}
        /> */}

        {/* Table number */}
        <g
          transform={`rotate(${-rotation}, ${size / 2}, ${
            (bottomTable + strokeWidth) / 2
          })`}
        >
          <text
            x="50%"
            y={textY}
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
      prevProps.type === nextProps.type &&
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

MemorizedSymetricTable.displayName = "SymetricTable";

export const SymetricTable = MemorizedSymetricTable;

export default SymetricTable;
