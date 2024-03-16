import { createContext, useContext, useEffect, useState } from "react";

const THEME_SELECTOR = "document-theme";
const CSS_DATA_THEME = "data-theme";
const DEFAULT_THEME = "light";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  getDocumentTheme: () => null,
});

export const ThemeProvider = ({ children }) => {
  const getDocumentTheme = () => {
    if (typeof document === "undefined") return DEFAULT_THEME;
    return (
      document.documentElement.getAttribute(CSS_DATA_THEME) ?? DEFAULT_THEME
    );
  };

  const addEventTheme = (theme) => {
    const event = new CustomEvent("themeChanged", { detail: { theme } });
    document.dispatchEvent(event);
  };

  const changeTheme = (theme) => {
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
    console.log("Theme set to:", localTheme);
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
      const handleThemeChange = (event) => {
        setCurrentTheme(event.detail.theme);
      };

      document.addEventListener("themeChanged", handleThemeChange);

      return () => {
        document.removeEventListener("themeChanged", handleThemeChange);
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
    <ThemeContext.Provider id="app" value={values}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
