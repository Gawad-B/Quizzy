import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

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
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        color: 'white',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
        </Box>
        <Box sx={{ fontSize: 40, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
