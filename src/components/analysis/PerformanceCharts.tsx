import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

interface PerformanceChartsProps {
  subjectId: string;
  performance?: {
    overallScore: number;
    strongAreas: string[];
    weakAreas: string[];
    questionTypes: Record<string, number>;
  };
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ subjectId, performance }) => {
  const { theme } = useTheme();

  const data = performance ?? {
    overallScore: 0,
    strongAreas: [],
    weakAreas: [],
    questionTypes: {},
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3 
      }}>
        {/* Overall Score */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
            {data.overallScore}%
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Overall Score
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {subjectId} Performance
          </Typography>
        </Paper>

        {/* Question Types */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Category Performance
          </Typography>
          {Object.entries(data.questionTypes).map(([type, score]) => (
            <Box key={type} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{type}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {score}%
                </Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                bgcolor: theme.palette.action.hover, 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: `${score}%`, 
                  height: '100%', 
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 4
                }} />
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Strong Areas */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.success.main }}>
            Strong Areas
          </Typography>
          {data.strongAreas.length === 0 && <Typography variant="body2">No strong areas yet.</Typography>}
          {data.strongAreas.map((area) => (
            <Typography key={area} variant="body2" sx={{ mb: 1 }}>
              - {area}
            </Typography>
          ))}
        </Paper>

        {/* Weak Areas */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.warning.main }}>
            Areas for Improvement
          </Typography>
          {data.weakAreas.length === 0 && <Typography variant="body2">No weak areas yet.</Typography>}
          {data.weakAreas.map((area) => (
            <Typography key={area} variant="body2" sx={{ mb: 1 }}>
              - {area}
            </Typography>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default PerformanceCharts;
