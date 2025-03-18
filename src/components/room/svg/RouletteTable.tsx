import React, { useEffect, useRef, useState } from "react";
import { TableProps, TableType } from "../types";

import { SvgWrapper, useAnimation } from "./SvgWrapper";

const MemorizedRouletteTable = React.memo(
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
    opacity = 0.3,
    style,
    type,
    onClick,
  }: TableProps) => {
    const strokeWidth = size * widthLine;
    const textSize = size * textRatio;
    const subTextSize = textSize * 0.25;

    // Dimensions de la table
    const length = Math.round((size - strokeWidth) / 2);
    const width = Math.round(length * (0.3 + 2 * heightRatio));
    const cornerRadius = Math.round(size * 0.2 * heightRatio);

    const longSide = Math.round(size - strokeWidth - 2 * +cornerRadius);
    const concaveRadius = Math.round(size * concaveRatio); // rayon des quarts de cercle concaves pour le croupier

    const concaveRadiusY = Math.round((concaveRadius * 3) / 4);
    const concaveLarge = Math.round(
      Math.max(longSide * 0.6 - concaveRadius * 3.5, size * 0.1)
    );
    const concaveSide = Math.round(
      (longSide - concaveLarge) / 2 - concaveRadius
    );
    const bottomTable = Math.round(width + cornerRadius);

    const widthTable = Math.round(width - cornerRadius);

    const cylinderRadius = parseFloat((size * 0.14).toFixed(2));
    const cylinderX = Math.round(size * 0.03 + strokeWidth + cylinderRadius);
    const cylinderY = Math.round((bottomTable - concaveRadiusY) / 2);

    const widthCarpet = Math.round(size * 0.2);
    const lengthCarpet = Math.round(
      size * 0.9 - strokeWidth - cylinderRadius - cylinderX
    );
    const carpetX = Math.round(size * 0.05 + strokeWidth / 2);
    const carpetAxisY = Math.round((bottomTable - concaveRadiusY) / 2);

    const textRef = useRef<SVGTextElement>(null);
    const [adjustedFontSize, setAdjustedFontSize] = useState(subTextSize);
    const [animationkey, setAnimationKey] = useState(flashDuration > 0 ? 1 : 0);

    const direction = type === TableType.roulette ? 1 : -1;
    const arcDirection = type === TableType.roulette ? 1 : 0;
    const cylinderPosX =
      type === TableType.roulette ? size - cylinderX : cylinderX;
    const startX =
      type === TableType.roulette
        ? cornerRadius + strokeWidth / 2
        : size - (cornerRadius + strokeWidth / 2);
    const carpetPosX = type === TableType.roulette ? carpetX : size - carpetX;

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
        onClick={onClick}
      >
        {/* Table shape */}
        <path
          d={
            `
          M ${startX},${bottomTable - concaveRadiusY} 
          a ${cornerRadius},${cornerRadius} 0 0,${arcDirection} ${
              -direction * cornerRadius
            },${-cornerRadius}` +
            `v ${-widthTable + concaveRadiusY}` +
            `a ${cornerRadius},${cornerRadius} 0 0,${arcDirection} ${
              direction * cornerRadius
            },${-cornerRadius}` +
            `h ${direction * longSide}` +
            `a ${cornerRadius},${cornerRadius} 0 0,${arcDirection} ${
              direction * cornerRadius
            },${cornerRadius}` +
            `v ${widthTable}` +
            `a ${cornerRadius},${cornerRadius} 0 0,${arcDirection} ${
              -direction * cornerRadius
            },${cornerRadius}` +
            `h ${-direction * concaveSide}` +
            `a ${concaveRadius},${concaveRadiusY} 0 0,${1 - arcDirection} ${
              -direction * concaveRadius
            },${-concaveRadiusY}` +
            `z`
          }
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Cylinder */}
        <circle
          cx={cylinderPosX}
          cy={cylinderY}
          r={cylinderRadius}
          fill={borderColor}
          stroke="#d0d4d4"
          strokeWidth="2"
          opacity={opacity}
        />
        {/* Carpet for roulette game */}
        <path
          d={
            `M ${carpetPosX},${carpetAxisY - widthCarpet / 2} ` +
            `h ${direction * lengthCarpet} ` +
            `l ${direction * widthCarpet * 0.2},${widthCarpet / 2} ` +
            `l ${-direction * widthCarpet * 0.2},${widthCarpet / 2} ` +
            `h ${-direction * lengthCarpet} ` +
            `z`
          }
          fill={borderColor}
          stroke="#d0d4d4"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={opacity}
        />

        {/* vertical symmetry line  */}
        {/* <line
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

MemorizedRouletteTable.displayName = "RouletteTable";

export const RouletteTable = MemorizedRouletteTable;

export default RouletteTable;
