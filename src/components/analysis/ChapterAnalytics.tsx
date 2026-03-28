import React from 'react';
import { Box, Typography, Card, CardContent, Chip, LinearProgress, Grid } from '@mui/material';
import { TrendingUp as TrendingIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface ChapterAnalyticsProps {
  chapters?: Array<{
    id: string;
    name: string;
    score: number;
    questions: number;
    correct: number;
    wrong: number;
    trend: 'up' | 'down';
    timeSpent: number;
  }>;
}

const ChapterAnalytics: React.FC<ChapterAnalyticsProps> = ({ chapters = [] }) => {

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#2196f3';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {chapters.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography sx={{ opacity: 0.8 }}>No chapter analytics yet for this subject.</Typography>
          </Grid>
        )}
        {chapters.map((chapter, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ 
              height: '100%',
              border: `1px solid ${getScoreColor(chapter.score)}20`,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    fontSize: '1rem',
                    lineHeight: 1.2
                  }}>
                    {chapter.name}
                  </Typography>
                  <Chip 
                    label={`${chapter.score}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getScoreColor(chapter.score),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Questions: {chapter.questions}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {chapter.trend === 'up' ? (
                        <TrendingIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                      )}
                      <Typography variant="caption" sx={{ 
                        color: chapter.trend === 'up' ? '#4caf50' : '#f44336',
                        fontWeight: 600
                      }}>
                        {chapter.trend === 'up' ? 'Improving' : 'Needs Work'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                      label={`${chapter.correct} correct`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip 
                      label={`${chapter.wrong} wrong`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={chapter.score} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(chapter.score)
                    }
                  }} 
                />

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    Time Spent: {formatTime(chapter.timeSpent)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChapterAnalytics;
