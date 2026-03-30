import type { FC } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  Toolbar,
  AppBar,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  Dashboard as OverviewIcon,
  Analytics as AnalyticsIcon,
  Quiz as CreateQuizIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthQuery } from '../../hooks/useAuthQuery';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: FC<SidebarProps> = ({ open, onToggle }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { logout, user, isLoggingOut } = useAuthQuery();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = 280;

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Overview', icon: <OverviewIcon />, path: '/overview' },
    { text: 'Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Create Quiz', icon: <CreateQuizIcon />, path: '/create-quiz' },
    { text: 'Bookmarks', icon: <BookmarkIcon />, path: '/bookmarks' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <SchoolIcon 
          sx={{ 
            fontSize: 32, 
            color: theme.palette.text.primary,
          }} 
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            letterSpacing: '-0.02em'
          }}
        >
          Quizzy
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                background: isActiveRoute(item.path) 
                  ? theme.palette.action.selected
                  : 'transparent',
                color: isActiveRoute(item.path) 
                  ? theme.palette.text.primary
                  : theme.palette.text.primary,
                boxShadow: isActiveRoute(item.path)
                  ? (isDarkMode ? '0 6px 16px rgba(0, 0, 0, 0.35)' : '0 6px 16px rgba(15, 23, 42, 0.12)')
                  : 'none',
                '&:hover': {
                  background: isActiveRoute(item.path)
                    ? theme.palette.action.selected
                    : theme.palette.action.hover,
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(15, 23, 42, 0.12)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActiveRoute(item.path) ? 600 : 500,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Info and Logout */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {user && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                mb: 0.5
              }}
            >
              {user.first_name} {user.last_name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              {user.email}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mb: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{
              borderRadius: 2,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(248, 113, 113, 0.14)' : 'rgba(220, 38, 38, 0.12)',
                color: theme.palette.error.main
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary={isLoggingOut ? "Logging out..." : "Logout"}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            />
          </ListItemButton>
        </Box>

        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              fontSize: '0.75rem'
            }}
          >
            Theme
          </Typography>
          <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.disabled,
            textAlign: 'center',
            display: 'block',
            fontSize: '0.7rem'
          }}
        >
          Quizzy v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            backgroundColor: isDarkMode ? 'rgba(11, 11, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: theme.palette.text.primary,
            boxShadow: isDarkMode ? '0 2px 10px rgba(0, 0, 0, 0.35)' : '0 2px 10px rgba(15, 23, 42, 0.08)',
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
            zIndex: theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <SchoolIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quizzy
              </Typography>
            </Box>
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: isDarkMode ? 'rgba(11, 11, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)'
            },
          }}
        >
          <Box sx={{ height: 64 }} /> {/* Spacer for AppBar */}
          {drawerContent}
        </Drawer>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: isDarkMode ? 'rgba(19, 19, 22, 0.95)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: isDarkMode ? '2px 0 20px rgba(0, 0, 0, 0.35)' : '2px 0 20px rgba(15, 23, 42, 0.08)'
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;