// src/context/Theme/ThemeProvider.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { ThemeContext } from "../../hooks/useThemeContext";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔹 THEME PROVIDER - DARK/LIGHT MODE SYSTEM
 *
 * FEATURES:
 * ✅ Auto-detects system preference
 * ✅ Saves to localStorage ("dh_theme")
 * ✅ Updates HTML data-theme attribute
 * ✅ Adds/removes "dh-dark" body class
 * ✅ Toggle button ready
 * ✅ Mobile/Desktop perfect
 * ════════════════════════════════════════════════════════════════════════════
 */

export function ThemeProvider({ children }) {
  // ============================================================================
  // 🌙 STATE DECLARATION
  // ============================================================================
  /**
   * ✅ theme - "light" or "dark"
   * Loads from localStorage or defaults to system preference
   */
  const [theme, setTheme] = useState(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem("dh_theme");
    if (saved && ["light", "dark"].includes(saved)) {
      return saved;
    }
    // 2. Auto-detect system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // ============================================================================
  // 🚀 THEME CHANGE EFFECT
  // ============================================================================
  /**
   * ✅ useEffect - Runs on theme change
   * 1. Sets HTML data-theme="dark/light"
   * 2. Saves to localStorage
   * 3. Adds/removes "dh-dark" body class
   * 4. Logs theme change (debug only)
   */
  useEffect(() => {
    // STEP 1: HTML Attribute (for CSS :root)
    document.documentElement.setAttribute("data-theme", theme);

    // STEP 2: Save to localStorage
    localStorage.setItem("dh_theme", theme);

    // STEP 3: Body Class (for legacy CSS)
    if (theme === "dark") {
      document.body.classList.add("dh-dark");
    } else {
      document.body.classList.remove("dh-dark");
    }

    // STEP 4: Debug log (comment out in production)
    console.log(`🌙 Theme set to: ${theme} (Saved to localStorage)`);
  }, [theme]);

  // ============================================================================
  // 🔄 TOGGLE FUNCTION
  // ============================================================================
  /**
   * ✅ toggleTheme - Switches light ↔ dark
   * Memoized for stability
   */
  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  // ============================================================================
  // 🔍 INITIALIZATION LOG (DEBUG ONLY)
  // ============================================================================
  /**
   * ✅ useEffect - Runs once on mount to log initial state
   * Comment out in production
   */
  useEffect(() => {
    console.log("🌙 ThemeProvider initialized with theme:", theme);
    console.log("💾 localStorage:", localStorage.getItem("dh_theme"));
    console.log(
      "📱 System Prefers:",
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty; runs only on mount

  // ============================================================================
  // 🎯 PROVIDER VALUE - EXPORTS
  // ============================================================================
  /**
   * ✅ Memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(
    () => ({
      theme, // "light" | "dark"
      toggleTheme, // () => void
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
