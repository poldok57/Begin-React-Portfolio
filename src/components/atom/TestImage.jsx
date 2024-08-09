"use client";
import { useEffect } from "react";
import { withMousePosition } from "../windows/withMousePosition";
import { useComponentSize } from "../windows/WithResizing";
import Image from "next/image";

const DEFAULT_SIZE = { width: 250, height: 250 };
export const TestImage = ({ image_width }) => {
  const { setMinimumSize } = useComponentSize();
  setMinimumSize({ width: 100, height: 100 });
  return (
    <div
      className="group/testImage"
      style={{ width: image_width || "100%", height: "100%" }}
    >
      <Image
        className="object-cover rounded-lg"
        src="/images/card-18-250.jpg"
        alt="Description de l'image"
        layout="responsive"
        width={DEFAULT_SIZE.width}
        height={DEFAULT_SIZE.height}
      />
      <div className="text-center rounded opacity-20 bg-paper group-hover/testImage:opacity-100">
        absolute image
      </div>
    </div>
  );
};

export const TestImageWP = withMousePosition(TestImage);
