import { useRef } from "react";
import { Typography } from "../atom/Typography";
import { MemoryCard } from "./MemoryCard";
import { MemoryNbrTry } from "./MemoryNbrTry";
import { useMemoryContext } from "./MemoryProvider";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import { withMousePosition } from "../windows/withMousePosition";
import { alertMessage } from "../alert-messages/alertMessage";
import { RefreshCcw } from "lucide-react";

import clsx from "clsx";
import { useEffect } from "react";

const VERTICAL_MARGIN = 120;
const HORIZONTAL_MARGIN = 10;

export const MemoryBoard = () => {
  // Memory Game - Exercise
  const {
    getCards,
    getSize,
    getWidthCards,
    setWidthCards,
    isGameFinished,
    resetGame,
  } = useMemoryContext();
  const ref = useRef(null);

  const cards = getCards();
  const finisedRef = useRef(false);
  const size = getSize();
  const widthCards = getWidthCards();
  const memoConfig = useRef(null);
  const configChange = useRef(false);
  const memoWidthCards = useRef(widthCards);
  const memoWidthParent = useRef(null);

  let configId = 100 * widthCards + 10 * size.width + size.height;

  if (memoConfig.current !== configId) {
    configChange.current = true;
    memoConfig.current = configId;
  } else {
    configChange.current = false;
  }

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    memoWidthParent.current = ref.current.parentElement.clientWidth;
  }, [ref.current]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        let entry = entries[0];
        let cardSizeW = Math.min(
          entry.target.clientWidth,
          document.documentElement.clientWidth
        );
        let cardSizeH = Math.min(
          entry.target.clientHeight,
          document.documentElement.clientHeight - VERTICAL_MARGIN
        );
        cardSizeW = (cardSizeW - size.width * 16) / size.width;
        cardSizeH = (cardSizeH - size.height * 16) / size.height;

        let cardSize = Math.min(cardSizeW, cardSizeH);
        cardSize = Math.floor(cardSize / 5) * 5;
        // console.log(
        //   "NEWcardSize: ",
        //   cardSize,
        //   configChange.current ? "not applied" : ""
        // );
        if (!configChange.current) {
          setWidthCards(cardSize);
          if (memoWidthCards.current === cardSize) {
            ref.current.parentElement.style.width = null;
          }
        }
        configChange.current = false;
      }
    });

    if (
      ref.current.clientWidth + HORIZONTAL_MARGIN >
      ref.current.parentElement.clientWidth
    ) {
      // back to initial size
      if (memoWidthParent.current === ref.current.parentElement.clientWidth) {
        setWidthCards(memoWidthCards.current);
      }
      //  else ref.current.parentElement.style.width = null;
    }
    if (
      ref.current.clientHeight + VERTICAL_MARGIN >
      ref.current.parentElement.clientHeight
    ) {
      ref.current.parentElement.style.height = null;
    }

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
    finisedRef.current = true;
    alertMessage("Game finished !!!");
    info = "Game finished !!!";
  } else if (finisedRef.current) {
    info = "Start a new game";
    finisedRef.current = false;
  }

  return (
    <div ref={ref} className="flex overflow-hidden flex-col items-center h-fit">
      <MemoryNbrTry stop={finised} className="mt-6" />
      <button
        className="absolute right-1 top-12 p-1 text-gray-900 bg-gray-100 rounded-lg border border-gray-400 cursor-pointer hover:bg-gray-200"
        onClick={() => resetGame(size)}
      >
        <RefreshCcw size={14} />
      </button>
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
