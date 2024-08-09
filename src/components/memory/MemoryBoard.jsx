import { useRef } from "react";
import { Typography } from "../atom/Typography";
import { MemoryCard } from "./MemoryCard";
import { MemoryNbrTry } from "./MemoryNbrTry";
import { useMemoryContext } from "./MemoryProvider";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import { withMousePosition } from "../windows/withMousePosition";
import { alertMessage } from "../alert-messages/alertMessage";
import { RefreshCcw, Maximize2, Minimize2 } from "lucide-react";
import { useComponentSize } from "../windows/WithResizing";
import { debounce } from "../../lib/utils/debounce";
import clsx from "clsx";
import { useEffect } from "react";

const VERTICAL_MARGIN = 85;
const HORIZONTAL_MARGIN = 10;
const CARD_MARGIN = 12;

const ResizeButtons = ({
  className,
  resizingParent,
  direction = "row",
  size = 16,
  step = 5,
}) => {
  const handleResize = (variable) => {
    resizingParent(variable);
  };

  return (
    <div
      className={clsx("flex gap-2", className, {
        "flex-row": direction === "row",
        "flex-col": direction === "col",
      })}
    >
      <button
        className="p-2 rounded-full bg-secondary hover:bg-secondary-hover hover:scale-110"
        onClick={() => handleResize(step)}
        aria-label="Enlarge"
      >
        <Maximize2 size={size} />
      </button>
      <button
        className="p-2 rounded-full bg-secondary hover:bg-secondary-hover hover:scale-110"
        onClick={() => handleResize(-step)}
        aria-label="Reduce"
      >
        <Minimize2 size={size} />
      </button>
    </div>
  );
};

export const MemoryBoard = ({ trace = false }) => {
  const {
    getCards,
    getSize,
    getWidthCards,
    setWidthCards,
    isGameFinished,
    resetGame,
    withResizeButtons = false,
  } = useMemoryContext();

  const { componentSize, resizeComponent, setMinimumSize } = useComponentSize();

  const ref = useRef(null);

  const cards = getCards();
  const finisedRef = useRef(false);
  const size = getSize();
  const widthCards = getWidthCards();
  const memoConfig = useRef(null);
  const configChange = useRef(false);
  const sizingChange = useRef(false);
  const memoWidthCards = useRef(widthCards);
  const memoWidthParent = useRef(null);

  const resizingParent = (variable) => {
    if (!ref.current) {
      return;
    }
    const parentWidth = componentSize.width;
    const parentHeight = componentSize.height;

    const newWidth = parentWidth + size.width * variable;
    const newHeight = parentHeight + size.height * variable;

    alertMessage(`resizing: ${newWidth}x${newHeight}`);

    resizeComponent({ width: newWidth, height: newHeight });

    if (variable > 0) {
      sizingChange.current = true;
    }
  };

  // memo all confiuried size in one number
  let configId = 256 * widthCards + 16 * size.width + size.height;

  if (memoConfig.current !== configId) {
    configChange.current = true;
    memoConfig.current = configId;
  } else {
    configChange.current = false;
  }

  useEffect(() => {
    const CARD_MIN = 50;
    const width =
      size.width * (CARD_MIN + CARD_MARGIN) +
      CARD_MARGIN +
      HORIZONTAL_MARGIN +
      5;
    const height =
      size.height * (CARD_MIN + CARD_MARGIN) +
      CARD_MARGIN +
      VERTICAL_MARGIN +
      5;
    setMinimumSize({ width, height });
  }, [size]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    memoWidthParent.current = componentSize.width;
  }, [componentSize]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const widthAvailable =
          Math.min(
            entry.target.clientWidth,
            document.documentElement.clientWidth
          ) - HORIZONTAL_MARGIN;
        const heightAvailable =
          Math.min(
            entry.target.clientHeight,
            document.documentElement.clientHeight
          ) - VERTICAL_MARGIN;
        const cardSizeW =
          (widthAvailable - (size.width + 1) * CARD_MARGIN) / size.width;
        const cardSizeH =
          (heightAvailable - (size.height + 1) * CARD_MARGIN) / size.height;

        const cardSize = Math.floor(Math.min(cardSizeW, cardSizeH) / 5) * 5;

        if (trace) {
          console.log(
            "MemoryBoard resizeObserver w:",
            cardSizeW,
            "h:",
            cardSizeH,
            "c:",
            cardSize
          );
        }

        if (!configChange.current) {
          const handleResizeCards = () => {
            setWidthCards(cardSize);
            if (memoWidthCards.current === cardSize && !sizingChange.current) {
              ref.current.parentElement.style.width = null;
            }
          };
          const debouncedResizeCards = debounce(handleResizeCards, 500);
          debouncedResizeCards(cardSize);
        }
        configChange.current = false;
      }
    });

    const handleResizeComponent = () => {
      if (ref.current.clientWidth > componentSize.width) {
        // back to initial size
        if (memoWidthParent.current === ref.current.parentElement.clientWidth) {
          setWidthCards(memoWidthCards.current);
        } // else ref.current.parentElement.style.width = null;
      }
      if (ref.current.clientHeight > componentSize.height) {
        ref.current.parentElement.style.height = null;
      }
      // init sizingChange
      sizingChange.current = false;
    };

    const debouncedResizeComponent = debounce(handleResizeComponent, 1000);
    debouncedResizeComponent();

    resizeObserver.observe(ref.current.parentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref.current, size, widthCards]);

  if (!cards || cards.length === 0) {
    return (
      <Typography variant="body2">
        <p style={{ color: "red", fontWeight: "bold" }}>
          An error occurs, there is no board.
        </p>
      </Typography>
    );
  }
  let info = " ";
  const finised = isGameFinished(cards);
  if (finised) {
    if (!finisedRef.current) {
      alertMessage("Game finished !!!");
    }
    finisedRef.current = true;

    info = "Game finished !!!";
  } else if (finisedRef.current) {
    info = "Start a new game";
    finisedRef.current = false;
  }

  return (
    <div ref={ref} className="flex overflow-hidden flex-col items-center h-fit">
      <MemoryNbrTry stop={finised} className="mt-5" />
      {withResizeButtons && (
        <ResizeButtons
          className="absolute left-2 top-12 p-1 text-gray-900 bg-gray-100 rounded-lg border border-gray-400 opacity-30 cursor-pointer hover:bg-gray-200 hover:opacity-100"
          resizingParent={resizingParent}
        />
      )}
      {finised && (
        <button
          className="absolute right-2 top-14 p-1 text-gray-900 bg-gray-100 rounded-lg border border-gray-400 cursor-pointer opacity-55 hover:bg-gray-200 hover:opacity-100 hover:scale-110"
          onClick={() => resetGame(size)}
        >
          <RefreshCcw size={30} />
        </button>
      )}
      <p style={{ color: "red", fontWeight: "bold", height: 15 }}>{info}</p>
      size: {size.width}x{size.height}
      <HightLightOnRender
        off={true}
        className={clsx("grid w-max gap-2", {
          "grid-cols-8": size.width == 8,
          "grid-cols-7": size.width == 7,
          "grid-cols-6": size.width == 6,
          "grid-cols-5": size.width == 5,
          "grid-cols-4": size.width == 4,
          "grid-cols-3": size.width == 3,
          "grid-cols-2": size.width == 2,
        })}
      >
        {cards.map((card, idx) => (
          <MemoryCard key={idx} card={card} idx={idx} />
        ))}
      </HightLightOnRender>
    </div>
  );
};

export const MemoryBoardWP = withMousePosition(MemoryBoard);
