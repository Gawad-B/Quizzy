import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { userAPI } from '../../services/userService';

const QuizReview = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz-review', 'me', quizId],
    queryFn: () => userAPI.getQuizReview(String(quizId), 'me'),
    enabled: Boolean(quizId),
    retry: false,
  });

  const summary = useMemo(() => {
    const questions = data?.questions || [];
    const correct = questions.filter((question) => question.isCorrect === true).length;
    const wrong = questions.filter((question) => question.isCorrect === false).length;
    const unanswered = questions.filter((question) => question.selectedAnswer === null).length;

    return {
      total: questions.length,
      correct,
      wrong,
      unanswered,
    };
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading quiz review...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to load quiz review.
        </Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/history')}>
          Back to History
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/history')}>
          Back to History
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          Quiz Review
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {data.quiz.title}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5 }}>
          {(data.quiz.subject ?? 'General')} • {new Date(data.quiz.date).toLocaleDateString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Score: ${data.quiz.score}%`} color={data.quiz.score >= 70 ? 'success' : 'warning'} />
          <Chip label={`Correct: ${summary.correct}/${summary.total}`} color="success" variant="outlined" />
          <Chip label={`Wrong: ${summary.wrong}`} color="error" variant="outlined" />
          {summary.unanswered > 0 && (
            <Chip label={`Unanswered: ${summary.unanswered}`} color="default" variant="outlined" />
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {data.questions.map((question, index) => (
          <Paper key={question.id} elevation={1} sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Question {index + 1}
              </Typography>
              <Chip
                label={
                  question.isCorrect === true
                    ? 'Correct'
                    : question.isCorrect === false
                      ? 'Wrong'
                      : 'Unanswered'
                }
                color={
                  question.isCorrect === true
                    ? 'success'
                    : question.isCorrect === false
                      ? 'error'
                      : 'default'
                }
                size="small"
              />
            </Box>

            <Typography sx={{ mb: 1.5 }}>{question.question}</Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
              Your answer:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color:
                  question.isCorrect === true
                    ? theme.palette.success.main
                    : question.isCorrect === false
                      ? theme.palette.error.main
                      : theme.palette.text.primary,
              }}
            >
              {question.selectedAnswer ?? 'Not answered'}
            </Typography>

            {question.isCorrect === false && (
              <>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1.5, mb: 0.5 }}>
                  Correct answer:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  {question.correctAnswer ?? 'N/A'}
                </Typography>
              </>
            )}

            {question.explanation && (
              <>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1.5, mb: 0.5 }}>
                  Explanation:
                </Typography>
                <Typography variant="body2">{question.explanation}</Typography>
              </>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default QuizReview;
