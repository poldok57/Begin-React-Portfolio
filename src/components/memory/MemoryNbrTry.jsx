import { useMemoryContext } from "./MemoryProvider";
import { useEffect, useState } from "react";

export const MemoryNbrTry = ({ stop = false }) => {
  const { getNbrTry, startTime } = useMemoryContext();
  const [duree, setDuree] = useState(0);

  useEffect(() => {
    if (stop) {
      return;
    }
    const interval = setInterval(() => {
      if (!startTime) return;
      const t = Math.floor((new Date() - startTime) / 1000);
      const h = Math.floor(t / 3600);
      let m = Math.floor((t % 3600) / 60);
      let s = t % 60;
      if (m < 10) m = "0" + m;
      if (s < 10) s = "0" + s;
      let stringTime = m + ":" + s;
      if (h) stringTime = h + ":" + stringTime;
      // set duration in time format
      setDuree(stringTime);
      // setDuree(Math.floor(t / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, stop]);

  return !getNbrTry() ? (
    <p>Start playing, choose two cards !</p>
  ) : (
    <p>
      Try: <b>{getNbrTry()}</b> in <b>{duree}</b>
    </p>
  );
};
