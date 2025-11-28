import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Chip } from '@mui/material';

interface ExamMode {
  id: 'solved' | 'new' | 'bookmarked' | 'all';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
}

interface ExamModeCardProps {
  mode: ExamMode;
  isSelected: boolean;
  onSelect: (modeId: 'solved' | 'new' | 'bookmarked' | 'all') => void;
}

const ExamModeCard: React.FC<ExamModeCardProps> = ({ mode, isSelected, onSelect }) => {
  return (
    <Card
      sx={{
        height: '100%',
        border: `2px solid ${isSelected ? mode.color : 'transparent'}`,
        backgroundColor: isSelected ? `${mode.color}10` : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: mode.color,
          backgroundColor: `${mode.color}15`
        }
      }}
    >
      <CardActionArea
        onClick={() => onSelect(mode.id)}
        sx={{ height: '100%', p: 0 }}
      >
        <CardContent sx={{ p: 3, height: '100%' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <Box sx={{ 
                fontSize: 48, 
                color: mode.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {mode.icon}
              </Box>
            </Box>
            
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: isSelected ? mode.color : 'inherit'
            }}>
              {mode.title}
            </Typography>
            
            {isSelected && (
              <Chip 
                label="Selected" 
                size="small" 
                sx={{ 
                  bgcolor: mode.color, 
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            )}
          </Box>

          {/* Description */}
          <Typography variant="body2" sx={{ 
            mb: 3, 
            color: 'text.secondary',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            {mode.description}
          </Typography>

          {/* Benefits */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: mode.color
            }}>
              Benefits:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mode.benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: mode.color 
                  }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ExamModeCard;
