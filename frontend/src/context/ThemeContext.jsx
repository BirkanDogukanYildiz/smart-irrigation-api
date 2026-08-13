import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "theme";

// index.html'deki erken script zaten sayfa yüklenir yüklenmez data-theme attribute'unu
// set ediyor (flaş/yanıp sönme olmasın diye). Burada aynı mantığı state'e senkronize ediyoruz.
function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage erişilemezse (gizli sekme vb.) sessizce sistem tercihine düş.
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Depolama dolu/erişilemez olsa bile uygulama çalışmaya devam etsin.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
