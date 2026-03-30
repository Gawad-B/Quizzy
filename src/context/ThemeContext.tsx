import React,{ createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Professional modern light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',
      light: '#374151',
      dark: '#030712',
    },
    secondary: {
      main: '#475569',
      light: '#64748b',
      dark: '#334155',
    },
    success: {
      main: '#15803d',
      light: '#16a34a',
    },
    warning: {
      main: '#b45309',
      light: '#d97706',
    },
    info: {
      main: '#1d4ed8',
      light: '#2563eb',
    },
    error: {
      main: '#b91c1c',
      light: '#dc2626',
    },
    background: {
      default: '#f7f7f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      disabled: '#94a3b8',
    },
    divider: '#e5e7eb',
    action: {
      hover: '#f3f4f6',
      selected: 'rgba(17, 24, 39, 0.08)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top right, #f1f5f9 0%, #f7f7f8 55%, #ffffff 100%)',
          backgroundAttachment: 'fixed',
          color: '#0f172a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: '#111827',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
          '&:hover': {
            background: '#0b1220',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.24)',
          },
        },
        outlined: {
          borderColor: 'rgba(15, 23, 42, 0.2)',
          color: '#111827',
          '&:hover': {
            borderColor: 'rgba(15, 23, 42, 0.45)',
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#111827',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// Professional modern dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f5f5f5',
      light: '#ffffff',
      dark: '#d4d4d8',
    },
    secondary: {
      main: '#a1a1aa',
      light: '#d4d4d8',
      dark: '#71717a',
    },
    success: {
      main: '#4ade80',
      light: '#86efac',
    },
    warning: {
      main: '#fbbf24',
      light: '#fde68a',
    },
    info: {
      main: '#93c5fd',
      light: '#bfdbfe',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
    },
    background: {
      default: '#0b0b0c',
      paper: '#131316',
    },
    text: {
      primary: '#f4f4f5',
      secondary: '#d4d4d8',
      disabled: '#71717a',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: 'rgba(255, 255, 255, 0.12)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top right, #1a1a1f 0%, #0b0b0c 60%, #050506 100%)',
          backgroundAttachment: 'fixed',
          color: '#f4f4f5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#131316',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.42)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#131316',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.42)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: '#f4f4f5',
          color: '#0b0b0c',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
          '&:hover': {
            background: '#ffffff',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.25)',
          color: '#f4f4f5',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.45)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#101013',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.18)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.42)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f5f5f5',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
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

    const faviconHref = isDarkMode ? '/vite2.png' : '/vite.png';
    let favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'app-favicon';
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      document.head.appendChild(favicon);
    }

    favicon.href = faviconHref;
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
