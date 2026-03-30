import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
  };
  sx?: any; // Using any for now to avoid import issues
}

const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  icon, 
  gradient,
  sx = {}
}) => {
  const theme = useMuiTheme();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 }, 
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${gradient.from}`,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' } }}>{value}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.78rem', sm: '0.86rem' } }}>{label}</Typography>
        </Box>
        <Box sx={{ fontSize: { xs: 30, sm: 36, md: 40 }, color: gradient.from, opacity: 0.9 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
