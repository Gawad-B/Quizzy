import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  CheckCircle as SolvedIcon,
  AddCircle as NewIcon,
  Bookmark as BookmarkedIcon,
  AllInclusive as AllIcon
} from '@mui/icons-material';
import ExamModeCard from './ExamModeCard';

interface ExamModeSelectorProps {
  examMode: 'solved' | 'new' | 'bookmarked' | 'all';
  onExamModeChange: (mode: 'solved' | 'new' | 'bookmarked' | 'all') => void;
}

const ExamModeSelector: React.FC<ExamModeSelectorProps> = ({ examMode, onExamModeChange }) => {
  const examModes = [
    {
      id: 'solved' as const,
      title: 'Previously Solved',
      description: 'Questions you have already attempted and solved',
      icon: <SolvedIcon />,
      color: '#4caf50',
      benefits: ['Familiar content', 'Review learning', 'Track progress']
    },
    {
      id: 'new' as const,
      title: 'New Questions',
      description: 'Fresh questions you have never seen before',
      icon: <NewIcon />,
      color: '#2196f3',
      benefits: ['Challenge yourself', 'Expand knowledge', 'Discover gaps']
    },
    {
      id: 'bookmarked' as const,
      title: 'Bookmarked',
      description: 'Questions you have saved for later practice',
      icon: <BookmarkedIcon />,
      color: '#ff9800',
      benefits: ['Focused practice', 'Personal selection', 'Targeted review']
    },
    {
      id: 'all' as const,
      title: 'Mixed Questions',
      description: 'Combination of all question types for variety',
      icon: <AllIcon />,
      color: '#9c27b0',
      benefits: ['Balanced practice', 'Mixed difficulty', 'Comprehensive review']
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AllIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Select Exam Mode
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Choose the type of questions you want in your quiz. Each mode offers different learning benefits.
      </Typography>

                        <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                    gap: 3 
                  }}>
                    {examModes.map((mode) => (
                      <ExamModeCard
                        key={mode.id}
                        mode={mode}
                        isSelected={examMode === mode.id}
                        onSelect={onExamModeChange}
                      />
                    ))}
                  </Box>

      {/* Selection Info */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        bgcolor: 'action.hover', 
        borderRadius: 2,
        border: `1px solid ${examModes.find(m => m.id === examMode)?.color}30`
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Selected Mode: {examModes.find(m => m.id === examMode)?.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {examModes.find(m => m.id === examMode)?.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default ExamModeSelector;
