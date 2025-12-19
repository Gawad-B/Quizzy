import React, { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme, isDarkMode } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1f3a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 280px)` },
          minHeight: '100vh',
          backgroundColor: 'transparent',
          pt: isMobile ? 8 : 0, // Add top padding for mobile AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;