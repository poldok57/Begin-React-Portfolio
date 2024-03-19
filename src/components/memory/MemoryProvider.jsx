import { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  CARD_STATE,
  getInitialMemory,
  isMemoryFinished,
  isPairCards,
} from "../../lib/memory";

import { GAME_STATUS } from "../../lib/memory";
import { useMessage } from "../../context/MessageProvider";

const MemoryContext = createContext({ startTime: 0, getNbrTry: () => 0 });

export const MemoryProvider = ({ children, ...props }) => {
  // const [nbrTry, setNbrTry] = useState(0);
  const [size, setSize] = useState({ width: 6, height: 6 });
  const [cards, setCards] = useState(() => getInitialMemory(6 * 6));

  const gameStatusRef = useRef(GAME_STATUS.PLAYING);
  const nbrTryRef = useRef(0);
  const startTimeRef = useRef(0);
  const firstCard = useRef();
  const timeoutRef = useRef(null);
  const { alertMessage } = useMessage();

  const getCards = () => {
    return cards;
  };

  const getNbrTry = () => {
    return nbrTryRef.current;
  };
  const changeCardState = (cardIdx, state) => {
    setCards((curr) => {
      if (typeof cardIdx === "number") {
        curr[cardIdx].state = state;
        return [...curr];
      }
      cardIdx.map((i) => (curr[i].state = state));
      return [...curr];
    });
  };

  const isPairCardsByIdx = (idx1, idx2) => {
    return isPairCards(cards[idx1], cards[idx2]);
  };

  // hide all cards on status Returned
  const hideTurnedCards = () => {
    setCards((curr) => {
      curr.map((card) => {
        if (card.state === CARD_STATE.RETURNED) {
          card.state = CARD_STATE.HIDE;
        }
        return card;
      });
      return [...curr];
    });
  };

  const getSize = () => {
    return size;
  };

  const isGameFinished = (lCards = null) => {
    if (lCards) {
      return isMemoryFinished(lCards);
    }
    return isMemoryFinished(cards);
  };

  const incrementTry = () => {
    if (nbrTryRef.current === 0) {
      startTimeRef.current = new Date();
    }
    nbrTryRef.current++;
  };

  const resetGame = (size, type) => {
    setSize(size);
    setCards(() => getInitialMemory(size.width * size.height, type));
    nbrTryRef.current = 0;
    startTimeRef.current = 0;
    gameStatusRef.current = GAME_STATUS.PLAYING;
  };

  //  ---- onClick ----
  const onClick = (idx) => {
    if (cards[idx].state !== CARD_STATE.HIDE) {
      return false;
    }
    if (
      gameStatusRef.current === GAME_STATUS.WAIT_FOR_CLEAR &&
      timeoutRef.current
    ) {
      // Timeout interruption by click --------------------
      hideTurnedCards();

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      alertMessage("clear timeout");

      gameStatusRef.current = GAME_STATUS.PLAYING;
      // console.log("return playing :", gameStatusRef.current);
    }
    // not playing -------------------------------------
    if (
      gameStatusRef.current !== GAME_STATUS.PLAYING &&
      gameStatusRef.current !== GAME_STATUS.WAITING_FOR_SECOND_CARD
    ) {
      return false;
    }
    alertMessage(`click: - ${gameStatusRef.current}`);
    changeCardState(idx, CARD_STATE.RETURNED);
    // choose first card ----------------------------
    if (gameStatusRef.current === GAME_STATUS.PLAYING) {
      firstCard.current = idx;
      gameStatusRef.current = GAME_STATUS.WAITING_FOR_SECOND_CARD;
      // choose second card ----------------------------
    } else if (gameStatusRef.current === GAME_STATUS.WAITING_FOR_SECOND_CARD) {
      incrementTry();
      changeCardState(idx, CARD_STATE.RETURNED);
      // found a pair --------------------------------
      if (isPairCardsByIdx(firstCard.current, idx)) {
        changeCardState([firstCard.current, idx], CARD_STATE.FIND);
        alertMessage(`pair found`);
        gameStatusRef.current = GAME_STATUS.PLAYING;

        // not a pair ---------------------------------
      } else {
        gameStatusRef.current = GAME_STATUS.WAIT_FOR_CLEAR;

        timeoutRef.current = setTimeout(() => {
          hideTurnedCards();
          gameStatusRef.current = GAME_STATUS.PLAYING;
          timeoutRef.current = null;
        }, 2500);
      }
    }
    return true;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  // ---- end; onClick ----

  const values = {
    startTime: startTimeRef.current,

    getNbrTry,
    isGameFinished,
    onClick,

    getCards,
    getSize,
    resetGame,
  };

  return (
    <MemoryContext.Provider {...props} value={values}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemoryContext = () => {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error(
      "useMemoryContext must be used within a MemoryContextProvider"
    );
  }
  return context;
};
