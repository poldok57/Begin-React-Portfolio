import styles from "./ToggleThemeButton.module.css";
import { MdOutlineModeNight, MdOutlineWbSunny } from "react-icons/md";
import clsx from "clsx";
import { useTheme } from "../context/ThemeProvider";
import { HightLightOnRender } from "../context/HightLightOnRender";

export const ToggleThemeButton = () => {
  const { setDark, setLight, useThemeListener } = useTheme();
  const theme = useThemeListener();
  const isDark = theme === "dark";

  // console.log("ToggleThemeButton rendered, theme:", theme);

  return (
    <HightLightOnRender
      off={true}
      hightLightColor="#61729d"
      className="fixed top-2 right-2 overflow-hidden rounded-full border-primary p-2"
    >
      <MdOutlineWbSunny
        onClick={setDark}
        className={clsx("relative h-6 w-6 cursor-pointer text-primary", {
          [styles.enter]: !isDark,
          [styles.exit]: isDark,
        })}
      />
      <MdOutlineModeNight
        onClick={setLight}
        className={clsx("absolute top-2 h-6 w-6 cursor-pointer text-primary", {
          [styles.enter]: isDark,
          [styles.exit]: !isDark,
        })}
      />
    </HightLightOnRender>
  );
};
