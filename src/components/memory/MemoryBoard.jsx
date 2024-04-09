import { useRef } from "react";
import { Typography } from "../atom/Typography";
import { MemoryCard } from "./MemoryCard";
import { MemoryNbrTry } from "./MemoryNbrTry";
import { useMemoryContext } from "./MemoryProvider";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import { useMessage } from "../../context/MessageProvider";
import { withMousePosition } from "../../context/withMousePosition";
import clsx from "clsx";

export const MemoryBoard = () => {
  // Memory Game - Exercise
  const { getCards, getSize, isGameFinished } = useMemoryContext();
  const { alertMessage } = useMessage();
  const cards = getCards();
  const finisedRef = useRef(false);

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
  const size = getSize();

  // alertMessage(`reload, size: ${size.width}x${size.height}`);
  return (
    <>
      <MemoryNbrTry stop={finised} className="mt-6" />
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
    </>
  );
};

export const MemoryBoardWP = withMousePosition(MemoryBoard);
