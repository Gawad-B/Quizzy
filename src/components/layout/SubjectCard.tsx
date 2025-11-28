import React from 'react';
import { Card, CardContent, Box, Typography, Chip, LinearProgress } from '@mui/material';
import { School as SubjectIcon, CheckCircle as CorrectIcon, Cancel as WrongIcon } from '@mui/icons-material';

interface SubjectCardProps {
  subject: {
    name: string;
    score: number;
    questions: number;
    correct: number;
    wrong: number;
  };
  getScoreColor: (score: number) => string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, getScoreColor }) => {
  return (
    <Card sx={{ 
      height: '100%',
      border: `1px solid ${getScoreColor(subject.score)}`,
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SubjectIcon sx={{ color: getScoreColor(subject.score) }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {subject.name}
            </Typography>
          </Box>
          <Chip 
            label={`${subject.score}%`}
            sx={{ 
              bgcolor: getScoreColor(subject.score),
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
            Questions: {subject.questions}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              icon={<CorrectIcon />}
              label={`${subject.correct} correct`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              icon={<WrongIcon />}
              label={`${subject.wrong} wrong`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={subject.score} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(subject.score)
            }
          }} 
        />
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
