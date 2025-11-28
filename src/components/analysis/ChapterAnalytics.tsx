import React from 'react';
import { Box, Typography, Card, CardContent, Chip, LinearProgress, Grid } from '@mui/material';
import { TrendingUp as TrendingIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface ChapterAnalyticsProps {
  subjectId: string;
}

const ChapterAnalytics: React.FC<ChapterAnalyticsProps> = ({ subjectId }) => {
  // Mock data for chapters - in real app this would come from API
  const chapterData = {
    math: [
      { name: 'Algebra Basics', score: 92, questions: 45, correct: 41, wrong: 4, trend: 'up', timeSpent: 180 },
      { name: 'Linear Equations', score: 88, questions: 38, correct: 33, wrong: 5, trend: 'up', timeSpent: 165 },
      { name: 'Quadratic Functions', score: 78, questions: 42, correct: 33, wrong: 9, trend: 'down', timeSpent: 200 },
      { name: 'Geometry', score: 95, questions: 35, correct: 33, wrong: 2, trend: 'up', timeSpent: 140 },
      { name: 'Trigonometry', score: 82, questions: 28, correct: 23, wrong: 5, trend: 'up', timeSpent: 175 },
      { name: 'Calculus Intro', score: 75, questions: 25, correct: 19, wrong: 6, trend: 'down', timeSpent: 190 }
    ],
    science: [
      { name: 'Physics Fundamentals', score: 85, questions: 40, correct: 34, wrong: 6, trend: 'up', timeSpent: 160 },
      { name: 'Chemistry Basics', score: 90, questions: 35, correct: 32, wrong: 3, trend: 'up', timeSpent: 145 },
      { name: 'Biology Systems', score: 88, questions: 38, correct: 33, wrong: 5, trend: 'up', timeSpent: 155 },
      { name: 'Earth Science', score: 82, questions: 30, correct: 25, wrong: 5, trend: 'down', timeSpent: 170 }
    ],
    history: [
      { name: 'Ancient Civilizations', score: 92, questions: 32, correct: 29, wrong: 3, trend: 'up', timeSpent: 140 },
      { name: 'Medieval Period', score: 88, questions: 28, correct: 25, wrong: 3, trend: 'up', timeSpent: 135 },
      { name: 'Modern History', score: 85, questions: 35, correct: 30, wrong: 5, trend: 'up', timeSpent: 150 },
      { name: 'World Wars', score: 90, questions: 30, correct: 27, wrong: 3, trend: 'up', timeSpent: 145 }
    ],
    literature: [
      { name: 'Classic Novels', score: 88, questions: 25, correct: 22, wrong: 3, trend: 'up', timeSpent: 120 },
      { name: 'Poetry Analysis', score: 82, questions: 20, correct: 16, wrong: 4, trend: 'down', timeSpent: 130 },
      { name: 'Shakespeare', score: 85, questions: 22, correct: 19, wrong: 3, trend: 'up', timeSpent: 125 },
      { name: 'Modern Literature', score: 90, questions: 18, correct: 16, wrong: 2, trend: 'up', timeSpent: 110 }
    ],
    geography: [
      { name: 'World Geography', score: 88, questions: 30, correct: 26, wrong: 4, trend: 'up', timeSpent: 140 },
      { name: 'Physical Geography', score: 85, questions: 25, correct: 21, wrong: 4, trend: 'up', timeSpent: 135 },
      { name: 'Human Geography', score: 82, questions: 28, correct: 23, wrong: 5, trend: 'down', timeSpent: 150 },
      { name: 'Economic Geography', score: 90, questions: 22, correct: 20, wrong: 2, trend: 'up', timeSpent: 125 }
    ]
  };

  const chapters = chapterData[subjectId as keyof typeof chapterData] || [];

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
        {chapters.map((chapter, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
