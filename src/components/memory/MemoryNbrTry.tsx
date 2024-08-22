import { useMemoryContext } from "./MemoryProvider";
import { useEffect, useState } from "react";

export const MemoryNbrTry = ({ stop = false, ...props }) => {
  const { getNbrTry, startTime } = useMemoryContext();
  const [duree, setDuree] = useState("");

  useEffect(() => {
    if (stop) {
      return;
    }
    const interval = setInterval(() => {
      if (!startTime) return;
      const t = Math.floor((Date.now() - startTime) / 1000);

      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const s = t % 60;

      const stringTime = `${h > 0 ? h + ":" : ""}${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

      // set duration in time format
      setDuree(stringTime);
      // setDuree(Math.floor(t / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, stop]);

  return (
    <div {...props}>
      {!getNbrTry() ? (
        <p>Start playing, choose two cards !</p>
      ) : (
        <p>
          Try: <b>{getNbrTry()}</b> in <b>{duree}</b>
        </p>
      )}
    </div>
  );
};
