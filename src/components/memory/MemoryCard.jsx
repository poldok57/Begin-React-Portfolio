import clsx from "clsx";
import { useRef } from "react";
import { HightLightOnRender } from "../../context/HightLightOnRender";
import styles from "./MemoryCard.module.css";
import { CARD_STATE } from "../../lib/memory";
import { useTheme } from "../../context/ThemeProvider";
import { useMemoryContext } from "./MemoryProvider";

export const MemoryCard = ({ card, idx }) => {
  // const [showLayer, setShowLayer] = useState(false);
  const timerRef = useRef();
  const isReturned =
    card.state === CARD_STATE.RETURNED || card.state === CARD_STATE.FIND;
  const { onClick, getWidthCards } = useMemoryContext();

  const hightLightImage = (e) => {
    // add class hightlight to target
    e.target.classList.add(styles.highlight);
  };
  const removeHightLight = (e) => {
    e.target.classList.remove(styles.highlight);
  };

  // si le nom de l'emoji commence par un '/' ou un '.' alors c'est une image
  // sinon c'est un emoji
  const isImage = card.emoji.match(/^\/|^\./);
  if (isImage) {
    return (
      <HightLightOnRender
        off={true}
        hightLightColor="lightyellow"
        className="relative"
      >
        <button
          className={clsx(
            styles.transition,
            "z-0 rounded border-primary  bg-secondary p-1",
            {
              [clsx("!bg-red-400", styles.rotate)]: !isReturned,
              [clsx("!bg-green-400", styles.bounce)]:
                card.state === CARD_STATE.FIND,
            }
          )}
        >
          <img
            src={"/images" + card.emoji}
            width={getWidthCards()}
            onClick={(e) => {
              hightLightImage(e);
            }}
            onMouseEnter={(e) => {
              timerRef.current = setTimeout(() => {
                hightLightImage(e);
              }, 1000);
            }}
            onMouseOut={(e) => {
              clearTimeout(timerRef.current);
              removeHightLight(e);
            }}
            className="block rounded-md bg-paper p-1"
          />
        </button>
        <button
          onClick={() => onClick(idx)}
          style={{ backfaceVisibility: "hidden" }}
          className={clsx(
            styles.transition,
            "absolute inset-0 z-0 flex items-center justify-center rounded border-2 border-primary bg-paper p-3",
            {
              [styles.rotate]: isReturned,
            }
          )}
        >
          <BackCard />
        </button>
      </HightLightOnRender>
    );
  }

  return (
    <div className="relative">
      <button
        className={clsx(
          styles.transition,
          "rounded border-primary bg-secondary p-0.5",
          {
            [clsx("!bg-red-400", styles.rotate)]: !isReturned,
            [clsx("!bg-green-400", styles.bounce)]:
              card.state === CARD_STATE.FIND,
          }
        )}
      >
        <span className="block rounded bg-paper p-3">{card.emoji}</span>
      </button>
      <button
        onClick={() => onClick(idx)}
        style={{ backfaceVisibility: "hidden" }}
        className={clsx(
          styles.transition,
          "absolute inset-0 flex rounded border-2 border-primary bg-paper p-3",
          {
            [styles.rotate]: isReturned,
          }
        )}
      >
        <BackCard />
      </button>
    </div>
  );
};

const BackCard = () => {
  const { useThemeListener } = useTheme();
  const theme = useThemeListener();
  return theme == "dark" ? " ? " : "❓";
};
