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
    <Box className="dashboard-page" sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* Welcome Header with User Info */}
      <Box sx={{
        mb: { xs: 3, md: 4 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'flex-start' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.8rem' }
          }}>
            Welcome back, {user?.first_name || 'User'}
          </Typography>
          <Typography variant="h6" sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: { xs: '0.98rem', sm: '1.05rem', md: '1.2rem' }
          }}>
            Ready to create some amazing quizzes today?
          </Typography>
          {user && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
        <Box sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>
          <ThemeToggle size="large" color="primary" showMenu={true} />
        </Box>
      </Box>

      {/* User Info Card */}
      {user && (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Your Profile
          </Typography>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
              sx={{ fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'center' } }}
            />
          </Box>
        </Paper>
      )}

      {/* Quick Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2, md: 3 },
        mb: { xs: 3, md: 4 }
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
        gap: { xs: 2, md: 3 }
      }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, height: '100%' }}>
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

        <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, height: '100%' }}>
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
              <Box key={`${quiz.name}-${index}`} sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                  label={quiz.status === 'Finished' ? `${quiz.score}%` : quiz.status === 'Timed Out' ? 'Timed Out' : 'Unfinished'}
                  size="small"
                  sx={{
                    bgcolor:
                      quiz.status === 'Finished'
                        ? theme.palette.success.main
                        : quiz.status === 'Timed Out'
                          ? theme.palette.error.main
                          : theme.palette.warning.main,
                    color: 'white',
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                  }}
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