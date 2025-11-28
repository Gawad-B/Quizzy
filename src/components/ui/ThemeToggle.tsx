import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { 
  LightMode as LightModeIcon, 
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  showMenu?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'medium', 
  color = 'inherit',
  showMenu = false
}) => {
  const { isDarkMode, toggleTheme, resetToSystem } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showMenu) {
      setAnchorEl(event.currentTarget);
    } else {
      toggleTheme();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (action: 'toggle' | 'reset') => {
    if (action === 'toggle') {
      toggleTheme();
    } else if (action === 'reset') {
      resetToSystem();
    }
    handleClose();
  };

  if (!showMenu) {
    return (
      <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={handleClick}
          size={size}
          color={color}
          sx={{
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title="Theme options">
        <IconButton
          onClick={handleClick}
          size={size}
          color={color}
          sx={{
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleThemeChange('toggle')}>
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            Switch to {isDarkMode ? 'light' : 'dark'} mode
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('reset')}>
          <ListItemIcon>
            <SystemIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Use system preference
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;
