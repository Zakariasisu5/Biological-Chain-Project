import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large' | 'x-large';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });
  
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return (savedFontSize as FontSize) || 'medium';
  });
  
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true';
  });
  
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    return localStorage.getItem('reduceMotion') === 'true';
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  const setFontSize = (newSize: FontSize) => {
    localStorage.setItem('fontSize', newSize);
    setFontSizeState(newSize);
  };

  const setHighContrast = (enabled: boolean) => {
    localStorage.setItem('highContrast', String(enabled));
    setHighContrastState(enabled);
  };

  const setReduceMotion = (enabled: boolean) => {
    localStorage.setItem('reduceMotion', String(enabled));
    setReduceMotionState(enabled);
  };

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      document.documentElement.classList.remove('dark', 'light');
      
      if (theme === 'system') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'medium' ? '16px' : 
      fontSize === 'large' ? '18px' : '20px';
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        fontSize, 
        setFontSize, 
        highContrast, 
        setHighContrast,
        reduceMotion,
        setReduceMotion
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
