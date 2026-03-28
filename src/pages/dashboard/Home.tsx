import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import {
  Quiz as QuizIcon,
  TrendingUp as TrendingIcon,
  Help as QuestionsIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import StatCard from '../../components/ui/StatCard';
import { useAuthQuery } from '../../hooks/useAuthQuery';
import { useUserQuery } from "../../hooks/useUserQuery";
import { useOverviewQuery } from '../../hooks/useOverviewQuery';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user: authUser } = useAuthQuery(); // get logged-in user from cache
  const { data: user, isLoading: loading, error } = useUserQuery(authUser?.id);
  const { data: overview } = useOverviewQuery();

  const totalQuizzes = overview?.totalQuizzes ?? 0;
  const averageScore = overview?.averageScore ?? 0;
  const totalQuestions = overview?.totalQuestions ?? 0;
  const currentStreak = overview?.currentStreak ?? 0;
  const recentQuizzes = overview?.recentQuizzes ?? [];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error(error);
  }

  return (
    <Box className="dashboard-page" sx={{ p: 3 }}>
      {/* Welcome Header with User Info */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1
          }}>
            Welcome back, {user?.first_name || 'User'}! 👋
          </Typography>
          <Typography variant="h6" sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400
          }}>
            Ready to create some amazing quizzes today?
          </Typography>
          {user && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40
                }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        <ThemeToggle size="large" color="primary" showMenu={true} />
      </Box>

      {/* User Info Card */}
      {user && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Your Profile
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 60,
                height: 60
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                {user.email}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                User ID: {user.id}
              </Typography>
            </Box>
            <Chip
              label="Active"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>
      )}

      {/* Quick Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          value={totalQuizzes}
          label="Total Quizzes"
          icon={<QuizIcon />}
          gradient={{
            from: theme.palette.primary.main,
            to: theme.palette.primary.light
          }}
        />

        <StatCard
          value={`${averageScore}%`}
          label="Average Score"
          icon={<TrendingIcon />}
          gradient={{
            from: theme.palette.success.main,
            to: theme.palette.success.light
          }}
        />

        <StatCard
          value={totalQuestions}
          label="Questions Answered"
          icon={<QuestionsIcon />}
          gradient={{
            from: theme.palette.info.main,
            to: theme.palette.info.light
          }}
        />

        <StatCard
          value={currentStreak}
          label="Current Streak"
          icon={<TrophyIcon />}
          gradient={{
            from: theme.palette.warning.main,
            to: theme.palette.warning.light
          }}
        />
      </Box>

      {/* Quick Actions */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/create-quiz')}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              Create New Quiz
            </Button>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Recent Activity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentQuizzes.length === 0 && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No quiz activity yet.
              </Typography>
            )}

            {recentQuizzes.slice(0, 2).map((quiz, index) => (
              <Box key={`${quiz.name}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                <QuizIcon sx={{ color: theme.palette.primary.main }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                    {quiz.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                    {new Date(quiz.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  label={quiz.status === 'Finished' ? `${quiz.score}%` : 'Unfinished'}
                  size="small"
                  sx={{ bgcolor: quiz.status === 'Finished' ? theme.palette.success.main : theme.palette.warning.main, color: 'white' }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home;