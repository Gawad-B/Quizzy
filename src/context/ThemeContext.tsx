import React,{ createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Light theme with clean modern design
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00d4ff', // Cyan
      light: '#33ddff',
      dark: '#00a8cc',
    },
    secondary: {
      main: '#7c3aed', // Purple
      light: '#9d5eff',
      dark: '#5b21b6',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
    },
    info: {
      main: '#00d4ff',
      light: '#60a5fa',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    action: {
      hover: '#f1f5f9',
      selected: 'rgba(0, 212, 255, 0.08)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)',
          backgroundAttachment: 'fixed',
          color: '#0f172a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
          boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00a8cc 0%, #5b21b6 100%)',
            boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
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

// Dark theme with futuristic glassmorphism
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff', // Cyan
      light: '#33ddff',
      dark: '#00a8cc',
    },
    secondary: {
      main: '#7c3aed', // Purple
      light: '#9d5eff',
      dark: '#5b21b6',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
    },
    info: {
      main: '#00d4ff',
      light: '#60a5fa',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    background: {
      default: '#0a0e27', // Dark navy
      paper: 'rgba(255, 255, 255, 0.05)', // Glassmorphism
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(0, 212, 255, 0.16)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1f3a 100%)',
          backgroundAttachment: 'fixed',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
          boxShadow: '0 8px 20px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00a8cc 0%, #5b21b6 100%)',
            boxShadow: '0 12px 30px rgba(0, 212, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
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
