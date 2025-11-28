import React from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  Help as PartialIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimeIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
  School as SubjectIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/ui/StatCard';
import SubjectCard from '../../components/layout/SubjectCard';

const Overview = () => {
  const { theme } = useTheme();

  // Mock data - in real app this would come from API/database
  const studentStats = {
    totalQuizzes: 24,
    totalQuestions: 156,
    correctAnswers: 128,
    wrongAnswers: 23,
    partialAnswers: 5,
    averageScore: 82.1,
    totalTime: 1240, // minutes
    averageTimePerQuestion: 7.9, // minutes
    currentStreak: 8,
    bestStreak: 15,
    subjects: [
      { name: 'Mathematics', score: 89, questions: 45, correct: 40, wrong: 5 },
      { name: 'Science', score: 78, questions: 38, correct: 30, wrong: 8 },
      { name: 'History', score: 92, questions: 28, correct: 26, wrong: 2 },
      { name: 'Literature', score: 75, questions: 25, correct: 19, wrong: 6 },
      { name: 'Geography', score: 85, questions: 20, correct: 17, wrong: 3 }
    ],
    recentQuizzes: [
      { name: 'Algebra Quiz #12', score: 95, date: '2024-01-15', time: 18, questions: 20 },
      { name: 'Physics Test #8', score: 82, date: '2024-01-14', time: 25, questions: 25 },
      { name: 'World History #15', score: 88, date: '2024-01-13', time: 22, questions: 30 },
      { name: 'Chemistry Quiz #6', score: 76, date: '2024-01-12', time: 28, questions: 20 },
      { name: 'English Literature #9', score: 91, date: '2024-01-11', time: 20, questions: 25 }
    ]
  };

  const calculateAccuracy = () => {
    const total = studentStats.correctAnswers + studentStats.wrongAnswers + studentStats.partialAnswers;
    return {
      correct: (studentStats.correctAnswers / total * 100).toFixed(1),
      wrong: (studentStats.wrongAnswers / total * 100).toFixed(1),
      partial: (studentStats.partialAnswers / total * 100).toFixed(1)
    };
  };

  const accuracy = calculateAccuracy();

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 80) return theme.palette.info.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700, 
          color: theme.palette.text.primary,
          mb: 1
        }}>
          Performance Overview 📊
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 400
        }}>
          Track your learning progress and quiz performance
        </Typography>
      </Box>

      {/* Key Metrics Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <StatCard
          value={studentStats.totalQuizzes}
          label="Total Quizzes"
          icon={<TrophyIcon />}
          gradient={{
            from: theme.palette.primary.main,
            to: theme.palette.primary.light
          }}
        />

        <StatCard
          value={`${studentStats.averageScore}%`}
          label="Average Score"
          icon={<TrendingIcon />}
          gradient={{
            from: theme.palette.success.main,
            to: theme.palette.success.light
          }}
        />

        <StatCard
          value={studentStats.currentStreak}
          label="Current Streak"
          icon={<BrainIcon />}
          gradient={{
            from: theme.palette.info.main,
            to: theme.palette.info.light
          }}
        />

        <StatCard
          value={formatTime(studentStats.totalTime)}
          label="Total Time"
          icon={<TimeIcon />}
          gradient={{
            from: theme.palette.warning.main,
            to: theme.palette.warning.light
          }}
        />
      </Box>

      {/* Answer Ratio Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
            Answer Distribution
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CorrectIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Correct Answers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {studentStats.correctAnswers} ({accuracy.correct}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(accuracy.correct)} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.success.main
                }
              }} 
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WrongIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Wrong Answers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {studentStats.wrongAnswers} ({accuracy.wrong}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(accuracy.wrong)} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.error.main
                }
              }} 
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PartialIcon sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Partial Answers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {studentStats.partialAnswers} ({accuracy.partial}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(accuracy.partial)} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.warning.main
                }
              }} 
            />
          </Box>

          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.action.hover, 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Overall Accuracy: {accuracy.correct}%
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {studentStats.totalQuestions} questions answered
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
            Performance Insights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SpeedIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Avg. Time per Question
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {studentStats.averageTimePerQuestion}m
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrophyIcon sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Best Streak
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {studentStats.bestStreak} quizzes
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Improvement Trend
                </Typography>
              </Box>
              <Chip 
                label="+12.5%" 
                color="success" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider />

            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.primary.main, 
              borderRadius: 2,
              textAlign: 'center',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                🎯 Goal Achievement
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                You're on track to complete 30 quizzes this month!
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Subject Performance */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Subject Performance Breakdown
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2 
        }}>
          {studentStats.subjects.map((subject, index) => (
            <SubjectCard 
              key={index}
              subject={subject}
              getScoreColor={getScoreColor}
            />
          ))}
        </Box>
      </Paper>

      {/* Recent Quiz Performance */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Recent Quiz Performance
        </Typography>
        
        <List>
          {studentStats.recentQuizzes.map((quiz, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ 
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                }
              }}>
                <ListItemIcon>
                  <Avatar sx={{ 
                    bgcolor: getScoreColor(quiz.score),
                    width: 40,
                    height: 40
                  }}>
                    {quiz.score >= 90 ? 'A' : quiz.score >= 80 ? 'B' : quiz.score >= 70 ? 'C' : 'D'}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {quiz.name}
                      </Typography>
                      <Chip 
                        label={`${quiz.score}%`}
                        sx={{ 
                          bgcolor: getScoreColor(quiz.score),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {quiz.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {formatTime(quiz.time)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SubjectIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {quiz.questions} questions
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < studentStats.recentQuizzes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5
            }}
          >
            View All Quiz History
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Overview;