import React, { createContext, useContext, useEffect, useState } from "react";

const THEME_SELECTOR = "document-theme";
const CSS_DATA_THEME = "data-theme";
const DEFAULT_THEME = "light";

type ThemeEvent = Event & { detail: { theme: string } };

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  getDocumentTheme: () => DEFAULT_THEME as string,
  useThemeListener: () => DEFAULT_THEME as string,
  toggleTheme: () => DEFAULT_THEME as "light" | "dark",
  setDark: () => {},
  setLight: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getDocumentTheme = () => {
    if (typeof document === "undefined") return DEFAULT_THEME;
    return (
      document.documentElement.getAttribute(CSS_DATA_THEME) ?? DEFAULT_THEME
    );
  };

  const addEventTheme = (theme: string) => {
    const event = new CustomEvent("themeChanged", { detail: { theme } });
    document.dispatchEvent(event);
  };

  const changeTheme = (theme: string) => {
    document.documentElement.setAttribute(CSS_DATA_THEME, theme);
    window.localStorage.setItem(THEME_SELECTOR, theme);
    // Déclencher un événement personnalisé
    addEventTheme(theme);
  };

  useEffect(() => {
    let localTheme = window.localStorage.getItem(THEME_SELECTOR);
    if (!localTheme) {
      const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );
      localTheme = darkModeMediaQuery.matches ? "dark" : "light";
    }

    document.documentElement.setAttribute(CSS_DATA_THEME, localTheme);
    addEventTheme(localTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = getDocumentTheme() === "dark" ? "light" : "dark";
    changeTheme(newTheme);
    return newTheme;
  };
  const setDark = () => changeTheme("dark");
  const setLight = () => changeTheme("light");

  const useThemeListener = () => {
    const [currentTheme, setCurrentTheme] = useState(getDocumentTheme());

    useEffect(() => {
      const handleThemeChange = (event: ThemeEvent) => {
        setCurrentTheme(event.detail.theme);
      };

      document.addEventListener(
        "themeChanged",
        handleThemeChange as EventListener
      );

      return () => {
        document.removeEventListener(
          "themeChanged",
          handleThemeChange as EventListener
        );
      };
    }, []);
    // console.log("useThemeListener, currentTheme:", currentTheme);
    return currentTheme;
  };

  const values = {
    theme: getDocumentTheme(),
    getDocumentTheme,
    useThemeListener,
    toggleTheme,
    setDark,
    setLight,
  };

  return (
    <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
