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
import { useOverviewQuery } from '../../hooks/useOverviewQuery';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data: studentStats, isLoading, error } = useOverviewQuery();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: theme.palette.text.secondary }}>Loading overview...</Typography>
      </Box>
    );
  }

  if (error || !studentStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load overview data.</Typography>
      </Box>
    );
  }

  const calculateAccuracy = () => {
    const total = studentStats.correctAnswers + studentStats.wrongAnswers + studentStats.partialAnswers;
    if (total === 0) {
      return { correct: '0.0', wrong: '0.0', partial: '0.0' };
    }
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
    const totalSeconds = Math.max(0, Math.round(minutes * 60));
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }

    return `${secs}s`;
  };

  const formatAverageTimePerQuestion = (minutes: number) => {
    const seconds = Math.max(0, Math.round(minutes * 60));
    return `${seconds}s`;
  };

  return (
    <Box className="dashboard-page" sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700, 
          color: theme.palette.text.primary,
          mb: 1,
          fontSize: { xs: '1.8rem', sm: '2.15rem', md: '2.8rem' }
        }}>
          Performance Overview
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 400,
          fontSize: { xs: '0.98rem', sm: '1.05rem', md: '1.2rem' }
        }}>
          Track your learning progress and quiz performance
        </Typography>
      </Box>

      {/* Key Metrics Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2, md: 3 }, 
        mb: { xs: 3, md: 4 } 
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
        gap: { xs: 2, md: 3 }, 
        mb: { xs: 3, md: 4 } 
      }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, height: '100%' }}>
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

        <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, height: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
            Performance Insights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <SpeedIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Avg. Time per Question
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {formatAverageTimePerQuestion(studentStats.averageTimePerQuestion)}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <TrendingIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Improvement Trend
                </Typography>
              </Box>
              <Chip 
                label={studentStats.totalQuizzes === 0 ? 'No data yet' : studentStats.averageScore >= 70 ? '+Improving' : 'Needs focus'} 
                color={studentStats.totalQuizzes === 0 ? 'default' : studentStats.averageScore >= 70 ? 'success' : 'warning'} 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider />

            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.1)'}`,
              borderRadius: 2,
              textAlign: 'center',
              color: theme.palette.text.primary,
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                Goal Achievement
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {studentStats.totalQuizzes > 0
                  ? `You completed ${studentStats.totalQuizzes} quizzes so far.`
                  : 'Start your first quiz to unlock detailed insights.'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Subject Performance */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, mb: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Subject Performance Breakdown
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: 1.5, sm: 2 } 
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
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Recent Quiz Performance
        </Typography>
        
        <List>
          {studentStats.recentQuizzes.length === 0 && (
            <Typography sx={{ color: theme.palette.text.secondary }}>No quizzes yet.</Typography>
          )}
          {studentStats.recentQuizzes.map((quiz, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ 
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                mb: 1,
                px: { xs: 1.25, sm: 2 },
                py: { xs: 1.25, sm: 1.5 },
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
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, mt: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {quiz.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {formatTime((quiz.durationSeconds || 0) / 60)}
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
            onClick={() => navigate('/history')}
            sx={{ 
              borderRadius: 2,
              px: { xs: 2.5, sm: 4 },
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