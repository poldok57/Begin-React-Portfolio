import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCwSquare,
  RotateCcwSquare,
} from "lucide-react";

import { useRoomStore } from "@/lib/stores/room";
import { zustandDesignStore } from "@/lib/stores/design";
import { zustandTableStore } from "@/lib/stores/tables";

import { cn } from "@/lib/utils/cn";
import { roundToTwoDigits } from "@/lib/utils/number";
import { getProgressiveStep } from "@/lib/utils/progressive-step";

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isWorking: boolean;
  isTouchDevice: boolean;
  scale: number;
  setScale: (scale: number) => void;
  needRefreshCanvas: () => void;
}

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  containerRef,
  isWorking,
  isTouchDevice = true,
  scale,
  setScale,
  needRefreshCanvas,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [canScroll, setCanScroll] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const scrollAmount = 100;
  let hideTimeout: NodeJS.Timeout;

  // components stores
  const { designStoreName, tablesStoreName } = useRoomStore();
  const designStoreRef = useRef(zustandDesignStore(designStoreName));
  const tablesStoreRef = useRef(zustandTableStore(tablesStoreName));

  useEffect(() => {
    designStoreRef.current = zustandDesignStore(designStoreName);
    tablesStoreRef.current = zustandTableStore(tablesStoreName);
  }, [designStoreName, tablesStoreName]);

  // Zoom gesture state
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);

  // get the progressive step
  const progressiveStep = useMemo(() => getProgressiveStep(10, 150), []);

  // move all elements
  const moveAllElements = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      const designStore = designStoreRef.current.getState();
      const tablesStore = tablesStoreRef.current.getState();

      // use the calculated step
      const step = progressiveStep(direction);

      const offset = {
        x: 0,
        y: 0,
      };
      switch (direction) {
        case "left":
          offset.x = -step;
          break;
        case "right":
          offset.x = step;
          break;
        case "up":
          offset.y = -step;
          break;
        case "down":
          offset.y = step;
          break;
      }

      designStore.moveAllDesignElements(offset);
      tablesStore.moveAllTables(offset);
    },
    [progressiveStep]
  );

  const rotateAllElements = useCallback(
    (direction: "left" | "right") => {
      const designStore = designStoreRef.current.getState();
      const tablesStore = tablesStoreRef.current.getState();

      const tables = tablesStore.getAllTables();
      const designs = designStore.getAllDesignElements();

      // Si aucun élément, ne rien faire
      if (tables.length === 0 && designs.length === 0) {
        return;
      }

      // Calculer les limites actuelles de tous les éléments (tables + designs)
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      // Analyser les tables
      tables.forEach((table) => {
        const { left, top } = table.position;
        const size = table.size ?? 200;

        // Ajuster les limites
        minX = Math.min(minX, left);
        maxX = Math.max(maxX, left + size);
        minY = Math.min(minY, top);
        maxY = Math.max(maxY, top + size);
      });

      // Analyser les designs
      designs.forEach((design) => {
        const { x, y, width, height } = design.size;
        const currentRotation = design.rotation ?? 0;

        // Tenir compte de la rotation pour calculer les dimensions réelles
        const effectiveWidth = currentRotation % 180 === 0 ? width : height;
        const effectiveHeight = currentRotation % 180 === 0 ? height : width;

        // Ajuster les limites
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + effectiveWidth);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + effectiveHeight);
      });

      // Calculer les dimensions actuelles
      const currentWidth = maxX - minX;
      const currentHeight = maxY - minY;

      // Calculer le centre de la page
      const centerX = minX + currentWidth / 2;
      const centerY = minY + currentHeight / 2;

      // Angle de rotation (90° ou -90°)
      const rotationAngle = direction === "right" ? 90 : -90;

      // Mettre à jour les tables
      tables.forEach((table) => {
        const { left, top } = table.position;
        const size = table.size ?? 200;
        const currentRotation = table.rotation ?? 0;

        // Pour les tables, calculer le centre de la table
        const tableCenterX = left + size / 2;
        const tableCenterY = top + size / 2;

        // Calculer les coordonnées relatives au centre de la page
        const relX = tableCenterX - centerX;
        const relY = tableCenterY - centerY;

        // Appliquer la rotation au centre de la table
        let newCenterX, newCenterY;

        if (direction === "right") {
          // Rotation 90° dans le sens horaire: (x, y) -> (-y, x)
          newCenterX = centerX - relY;
          newCenterY = centerY + relX;
        } else {
          // Rotation 90° dans le sens antihoraire: (x, y) -> (y, -x)
          newCenterX = centerX + relY;
          newCenterY = centerY - relX;
        }

        // Convertir le centre de la table en position du coin supérieur gauche
        const newLeft = newCenterX - size / 2;
        const newTop = newCenterY - size / 2;

        // Mettre à jour la table
        tablesStore.updateTable(table.id, {
          position: {
            left: Math.round(newLeft),
            top: Math.round(newTop),
          },
          rotation: (currentRotation + rotationAngle + 360) % 360,
        });
      });

      // Mettre à jour les designs
      designs.forEach((design) => {
        const { x, y, width, height } = design.size;
        const currentRotation = design.rotation ?? 0;

        // Déterminer les dimensions effectives actuelles en fonction de la rotation
        const isCurrentlyRotated = currentRotation % 180 !== 0;
        // const effectiveWidth = isCurrentlyRotated ? height : width;
        // const effectiveHeight = isCurrentlyRotated ? width : height;
        const effectiveWidth = width;
        const effectiveHeight = height;

        // Calculer le centre actuel de l'élément
        const designCenterX = x + effectiveWidth / 2;
        const designCenterY = y + effectiveHeight / 2;

        // Calculer les coordonnées relatives au centre de la page
        const relX = designCenterX - centerX;
        const relY = designCenterY - centerY;

        // Appliquer la rotation au centre du design
        let newCenterX, newCenterY;

        if (direction === "right") {
          // Rotation 90° dans le sens horaire: (x, y) -> (-y, x)
          newCenterX = centerX - relY;
          newCenterY = centerY + relX;
        } else {
          // Rotation 90° dans le sens antihoraire: (x, y) -> (y, -x)
          newCenterX = centerX + relY;
          newCenterY = centerY - relX;
        }

        // Déterminer les nouvelles dimensions effectives après rotation
        // La rotation de 90° ou -90° inverse toujours largeur et hauteur
        // const newEffectiveWidth = effectiveHeight;
        // const newEffectiveHeight = effectiveWidth;

        // // Calculer la nouvelle position du coin supérieur gauche
        // const newX = newCenterX - newEffectiveWidth / 2;
        // const newY = newCenterY - newEffectiveHeight / 2;
        // Calculer la nouvelle position du coin supérieur gauche THEORIQUE
        const newX = newCenterX - width / 2;
        const newY = newCenterY - height / 2;

        // Calculer la nouvelle rotation
        const newRotation = (currentRotation + rotationAngle + 360) % 360;

        // Mettre à jour le design
        const updatedDesign = {
          ...design,
          size: {
            ...design.size,
            x: Math.round(newX),
            y: Math.round(newY),
          },
          rotation: newRotation,
        };

        designStore.updateDesignElement(updatedDesign);
      });

      // Forcer un rafraîchissement du canvas
      needRefreshCanvas();
    },
    [needRefreshCanvas]
  );

  const updateScrollability = () => {
    if (!containerRef.current) return;

    const newCanScroll = {
      up: containerRef.current.scrollTop > 0,
      down:
        containerRef.current.scrollTop <
        containerRef.current.scrollHeight - containerRef.current.clientHeight,
      left: containerRef.current.scrollLeft > 0,
      right:
        containerRef.current.scrollLeft <
        containerRef.current.scrollWidth - containerRef.current.clientWidth,
    };
    setCanScroll(newCanScroll);
  };

  useEffect(() => {
    if (isWorking) {
      setIsVisible(false);
    } else {
      hideTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
    }

    return () => clearTimeout(hideTimeout);
  }, [isWorking]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollability();
    container.addEventListener("scroll", updateScrollability);

    // Add touch event handlers for pinch zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      // Calculate initial distance between two fingers
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      initialDistanceRef.current = distance;
      initialScaleRef.current = scale;
      initialPositionRef.current = {
        x: e.touches[0].clientX + dx / 2,
        y: e.touches[0].clientY + dy / 2,
      };

      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || initialDistanceRef.current === null) return;

      // Calculate current distance
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      // Calculate new scale based on the change in distance
      const scaleFactor = currentDistance / initialDistanceRef.current;
      const newScale = roundToTwoDigits(initialScaleRef.current * scaleFactor);

      if (containerRef.current && initialPositionRef.current) {
        const newPosition = {
          x: e.touches[0].clientX + dx / 2,
          y: e.touches[0].clientY + dy / 2,
        };
        const scroll = {
          left: newPosition.x - initialPositionRef.current.x,
          top: newPosition.y - initialPositionRef.current.y,
        };
        containerRef.current.scrollBy(-scroll.left, -scroll.top);
        initialPositionRef.current = newPosition;
      }

      // Limit scale to reasonable values
      if (newScale >= 0.1 && newScale <= 5) {
        setScale(newScale);
      }

      e.preventDefault();
    };

    const handleTouchEnd = () => {
      initialDistanceRef.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("scroll", updateScrollability);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef.current, scale, setScale]);

  const handleScroll = (direction: "up" | "down" | "left" | "right") => {
    if (!containerRef.current) return;

    switch (direction) {
      case "up":
        containerRef.current.scrollBy({
          top: -scrollAmount,
          behavior: "smooth",
        });
        break;
      case "down":
        containerRef.current.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
        break;
      case "left":
        containerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
        break;
      case "right":
        containerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
        break;
    }

    // Update after scrolling
    setTimeout(updateScrollability, 100);
  };

  const handleTouch = (
    e: React.TouchEvent,
    direction: "up" | "down" | "left" | "right"
  ) => {
    e.stopPropagation();
    handleScroll(direction);
  };

  const handleZoom = (
    e: React.TouchEvent | React.MouseEvent,
    zoomIn: boolean
  ) => {
    e.stopPropagation();
    const newScale = roundToTwoDigits(scale * (zoomIn ? 1.1 : 0.9));
    if (newScale >= 0.1 && newScale <= 5) {
      setScale(newScale);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {isTouchDevice && (
        <>
          <button
            className={cn(
              "fixed top-4 left-1/2 z-50 p-2 rounded-full -translate-x-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.up }
            )}
            onTouchStart={(e) => handleTouch(e, "up")}
          >
            <ChevronUp className="text-white" />
          </button>
          <button
            className={cn(
              "fixed bottom-4 left-1/2 z-50 p-2 rounded-full -translate-x-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.down }
            )}
            onTouchStart={(e) => handleTouch(e, "down")}
          >
            <ChevronDown className="text-white" />
          </button>
          <button
            className={cn(
              "fixed left-4 top-1/2 z-50 p-2 rounded-full -translate-y-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.left }
            )}
            onTouchStart={(e) => handleTouch(e, "left")}
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            className={cn(
              "fixed right-4 top-1/2 z-50 p-2 rounded-full -translate-y-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.right }
            )}
            onTouchStart={(e) => handleTouch(e, "right")}
          >
            <ChevronRight className="text-white" />
          </button>
        </>
      )}

      {/* Zoom buttons */}
      <button
        className="fixed right-6 bottom-6 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, true)}
        onClick={(e) => handleZoom(e, true)}
      >
        <ZoomIn className="text-white" />
      </button>
      <button
        className="fixed bottom-6 right-20 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, false)}
        onClick={(e) => handleZoom(e, false)}
      >
        <ZoomOut className="text-white" />
      </button>
      {/* Buttons for moving all elements */}
      <div className="flex fixed right-6 bottom-32 z-50 flex-col items-center p-1 bg-cyan-300 bg-opacity-30 rounded-xl border-2 border-cyan-500">
        {/* Up button */}
        <button
          className="items-center p-1 mb-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
          onTouchStart={() => moveAllElements("up")}
          onClick={() => moveAllElements("up")}
        >
          <ArrowUp className="text-white" />
        </button>

        {/* Middle row with left and right buttons */}
        <div className="flex justify-between w-24">
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => moveAllElements("left")}
            onClick={() => moveAllElements("left")}
          >
            <ArrowLeft className="text-white" />
          </button>
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => moveAllElements("right")}
            onClick={() => moveAllElements("right")}
          >
            <ArrowRight className="text-white" />
          </button>
        </div>

        {/* Down button */}
        <button
          className="p-1 mt-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
          onTouchStart={() => moveAllElements("down")}
          onClick={() => moveAllElements("down")}
        >
          <ArrowDown className="text-white" />
        </button>
        {/* Rotate buttons */}
        <div className="flex justify-between w-24">
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => rotateAllElements("left")}
            onClick={() => rotateAllElements("left")}
          >
            <RotateCcwSquare className="text-white" />
          </button>
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => rotateAllElements("right")}
            onClick={() => rotateAllElements("right")}
          >
            <RotateCwSquare className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
