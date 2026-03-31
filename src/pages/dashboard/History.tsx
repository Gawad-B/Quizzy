import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/userService';

const History = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Finished' | 'Unfinished' | 'Timed Out'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: quizzes = [], isLoading, error } = useQuery({
    queryKey: ['quizzes', 'me'],
    queryFn: () => userAPI.getQuizzes('me'),
    retry: false,
  });

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const subject = quiz.subject ?? 'General';
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || quiz.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [quizzes, searchTerm, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / itemsPerPage));
  const currentQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTabChange = (value: 'All' | 'Finished' | 'Unfinished' | 'Timed Out') => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  return (
    <Box className="dashboard-page" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: { xs: 2, md: 3 },
          color: theme.palette.text.primary,
          fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.8rem' },
        }}
      >
        Quiz History
      </Typography>

      <Paper elevation={2} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search quizzes"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 280 }, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            {(['All', 'Finished', 'Unfinished', 'Timed Out'] as const).map((tab) => (
              <Button
                key={tab}
                onClick={() => handleTabChange(tab)}
                variant={activeTab === tab ? 'contained' : 'outlined'}
                size="small"
                className="cool-filter-btn"
                sx={{
                  minWidth: { xs: 'calc(50% - 8px)', sm: 96 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {isLoading && (
        <Typography sx={{ color: theme.palette.text.secondary }}>Loading your quiz history...</Typography>
      )}

      {error && (
        <Typography color="error">Failed to load quiz history. Please try again.</Typography>
      )}

      {!isLoading && !error && (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {currentQuizzes.length === 0 && (
            <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                No quizzes found. Create your first quiz to see history here.
              </Typography>
            </Paper>
          )}

          {currentQuizzes.map((quiz) => (
            <Paper key={quiz.id} className="history-card" elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Avatar
                  variant="rounded"
                  src={quiz.image ?? 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=300&h=200'}
                  alt={quiz.title}
                  sx={{ width: { xs: '100%', sm: 72 }, height: { xs: 140, sm: 72 }, borderRadius: { xs: 2, sm: 1 } }}
                />

                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {(quiz.subject ?? 'General')} • {new Date(quiz.date).toLocaleDateString()}
                  </Typography>
                </Box>

                {quiz.status === 'Finished' || quiz.status === 'Timed Out' ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                    <Chip
                      label={quiz.status === 'Timed Out' ? `Timed Out • ${quiz.score}% (${quiz.totalQuestions} Q)` : `${quiz.score}% (${quiz.totalQuestions} Q)`}
                      color={quiz.status === 'Timed Out' ? 'error' : (quiz.score >= 70 ? 'success' : 'warning')}
                      sx={{ fontWeight: 600 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/history/${quiz.id}`)}
                    >
                      Review
                    </Button>
                  </Box>
                ) : (
                  <Chip label="Unfinished" color="default" sx={{ fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                )}
              </Box>
            </Paper>
          ))}

          {filteredQuizzes.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default History;
