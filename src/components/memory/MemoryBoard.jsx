import { useRef } from "react";
import { Typography } from "../atom/Typography";
import { MemoryCard } from "./MemoryCard";
import { MemoryNbrTry } from "./MemoryNbrTry";
import { useMemoryContext } from "./MemoryProvider";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import { useMessage } from "../../context/MessageProvider";

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
  const cName = `grid w-max grid-cols-${size.width} gap-2`;
  // const cName = "grid w-max grid-cols-6 gap-2"`;

  // alertMessage(`reload, size: ${size.width}x${size.height}`);
  return (
    <>
      <MemoryNbrTry stop={finised} />
      <p style={{ color: "red", fontWeight: "bold", height: 15 }}>{info}</p>
      size: {size.width}x{size.height}
      <HightLightOnRender off={true} className={cName}>
        {cards.map((card, idx) => (
          <MemoryCard key={idx} card={card} idx={idx} />
        ))}
      </HightLightOnRender>
    </>
  );
};
