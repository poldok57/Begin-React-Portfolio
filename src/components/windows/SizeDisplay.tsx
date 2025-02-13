import React, { useEffect, useRef, useState } from "react";

import { Size } from "../../lib/canvas/types";

export const SizeDisplay: React.FC<{ size: Size }> = ({ size }) => {
  const [visible, setVisible] = useState(false);
  const lastSizeRef = useRef<Size | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nbInitialRender = useRef(0);

  useEffect(() => {
    if (nbInitialRender.current < 3) {
      nbInitialRender.current++;
      lastSizeRef.current = { ...size };
      return;
    }

    if (
      lastSizeRef.current &&
      (size.width !== lastSizeRef.current.width ||
        size.height !== lastSizeRef.current.height)
    ) {
      setVisible(true);
      lastSizeRef.current = { ...size };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 2000);
    }
  }, [size]);

  return (
    <div
      style={{
        position: "absolute",
        top: -14,
        right: 2,
        backgroundColor: "gray",
        color: "white",
        fontSize: "0.7rem",
        padding: "2px 5px",
        opacity: visible ? 0.9 : 0,
        transition: visible ? "" : "opacity 2.5s",
        zIndex: visible ? 1001 : 0,
      }}
    >
      {Math.round(size.width)} x {Math.round(size.height)}
    </div>
  );
};
