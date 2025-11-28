import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // var(--color-primary)
      light: '#6366f1', // var(--color-primary-light)
      dark: '#3730a3', // var(--color-primary-dark)
    },
    secondary: {
      main: '#9ca3af', // var(--color-text-muted)
    },
    success: {
      main: '#10b981', // var(--color-success)
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b', // var(--color-warning)
      light: '#fbbf24',
    },
    info: {
      main: '#3b82f6', // var(--color-info)
      light: '#60a5fa',
    },
    error: {
      main: '#ef4444', // var(--color-danger)
    },
    background: {
      default: '#ffffff', // var(--color-bg)
      paper: '#ffffff', // var(--color-card-bg)
    },
    text: {
      primary: '#111827', // var(--color-text)
      secondary: '#4b5563', // var(--color-text-secondary)
      disabled: '#9ca3af', // var(--color-text-muted)
    },
    divider: '#e5e7eb', // var(--color-border)
    action: {
      hover: '#f3f4f6', // var(--color-bg-accent)
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          color: '#111827',
        },
      },
    },
  },
});

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8', // var(--color-chart-1) - lighter for dark mode
      light: '#a5b4fc',
      dark: '#6366f1',
    },
    secondary: {
      main: '#6b7280', // var(--color-chart-2)
    },
    success: {
      main: '#34d399', // var(--color-success)
      light: '#6ee7b7',
    },
    warning: {
      main: '#fbbf24', // var(--color-warning)
      light: '#fcd34d',
    },
    info: {
      main: '#60a5fa', // var(--color-info)
      light: '#93c5fd',
    },
    error: {
      main: '#f87171', // var(--color-danger)
    },
    background: {
      default: '#111827', // var(--color-bg)
      paper: '#1f2937', // var(--color-card-bg)
    },
    text: {
      primary: '#f9fafb', // var(--color-text)
      secondary: '#d1d5db', // var(--color-text-secondary)
      disabled: '#9ca3af', // var(--color-text-muted)
    },
    divider: '#374151', // var(--color-border)
    action: {
      hover: '#374151', // var(--color-bg-accent)
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#111827',
          color: '#f9fafb',
        },
      },
    },
  },
});

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  resetToSystem: () => void;
  theme: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or default to system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update CSS custom properties for global styles
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const resetToSystem = () => {
    localStorage.removeItem('theme');
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, resetToSystem, theme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
