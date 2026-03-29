
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, FormControl, Chip, LinearProgress, TextField, Alert, Collapse, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, CollectionsBookmark as CollectionsBookmarkIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/userService';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<Array<{
    id: string;
    question: string;
    choices: string[];
    correctAnswer: string | null;
    explanation?: string | null;
    category?: string | null;
    subcategory?: string | null;
    isBookmarked: boolean;
  }>>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isSavingResult, setIsSavingResult] = useState(false);

  useEffect(() => {
    const loadQuizQuestions = async () => {
      if (!quizId) {
        setLoadError('Quiz ID is missing.');
        setIsLoadingQuestions(false);
        return;
      }

      setIsLoadingQuestions(true);
      setLoadError(null);

      try {
        const response = await userAPI.getQuizQuestions(quizId);
        setQuestions(response.questions || []);
      } catch (error) {
        console.error(error);
        setLoadError('Failed to load quiz questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    void loadQuizQuestions();
  }, [quizId]);

  const handleBackToDashboard = () => {
    navigate('/create-quiz');
  };

  const handleAnswerSelect = (answer: string) => {
    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) {
      return;
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    setShowFeedback(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const handleQuestionNavigation = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
    const questionId = questions[newIndex]?.id;
    if (!questionId) {
      return;
    }

    setShowFeedback(prev => ({
      ...prev,
      [questionId]: false
    }));
  };

  const handleFinishQuiz = async () => {
    setIsSavingResult(true);

    const correctAnswersCount = questions.filter((question) => {
      const selectedAnswer = selectedAnswers[question.id];
      return selectedAnswer && selectedAnswer === question.correctAnswer;
    }).length;
    const calculatedScore = questions.length > 0
      ? Math.round((correctAnswersCount / questions.length) * 100)
      : 0;

    try {
      if (quizId) {
        await userAPI.updateQuiz(quizId, {
          status: 'Finished',
          score: calculatedScore,
        });

        await queryClient.invalidateQueries({ queryKey: ['quizzes', 'me'] });
        await queryClient.invalidateQueries({ queryKey: ['overview', 'me'] });
        await queryClient.invalidateQueries({ queryKey: ['subjects', 'me'] });
        await queryClient.invalidateQueries({ queryKey: ['analysis', 'me'] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setQuizCompleted(true);
      setIsSavingResult(false);
    }
  };

  const handleNoteChange = (note: string) => {
    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) {
      return;
    }

    setNotes(prev => ({
      ...prev,
      [questionId]: note
    }));
  };

  const toggleBookmark = async () => {
    const question = questions[currentQuestionIndex];
    if (!question) {
      return;
    }

    const nextBookmarkedState = !question.isBookmarked;

    try {
      await userAPI.setQuestionBookmark(question.id, nextBookmarkedState);
      setQuestions((prev) => prev.map((item) => (
        item.id === question.id
          ? { ...item, isBookmarked: nextBookmarkedState }
          : item
      )));
    } catch (error) {
      console.error(error);
      window.alert('Unable to update bookmark right now.');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  if (isLoadingQuestions) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography variant="h6">Loading quiz questions...</Typography>
      </Box>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError || 'No questions were found for this quiz.'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/create-quiz')}>
          Back to Create Quiz
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default,
      p: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToDashboard}
            sx={{ borderRadius: 2 }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<CollectionsBookmarkIcon />}
            onClick={() => navigate('/bookmarks')}
            sx={{ borderRadius: 2 }}
          >
            View Bookmarks
          </Button>
        </Box>
        
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 500
        }}>
          Quiz ID: {quizId}
        </Typography>
      </Box>

      {/* Quiz Progress */}
      <Paper elevation={0} sx={{ 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${answeredQuestions}/${questions.length} answered`}
              color="primary"
              variant="outlined"
            />
            {Object.keys(notes).length > 0 && (
              <Chip 
                label={`${Object.keys(notes).length} notes`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Quiz Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 4,
        maxWidth: '800px',
        mx: 'auto',
        width: '100%'
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: theme.palette.text.primary,
          mb: 3,
          lineHeight: 1.4
        }}>
          {currentQuestion.question}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {currentQuestion.category && (
            <Chip size="small" label={`Category: ${currentQuestion.category}`} color="info" variant="outlined" />
          )}
          {currentQuestion.subcategory && (
            <Chip size="small" label={`Subcategory: ${currentQuestion.subcategory}`} color="secondary" variant="outlined" />
          )}
          <Button
            size="small"
            variant="text"
            startIcon={currentQuestion.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={toggleBookmark}
          >
            {currentQuestion.isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </Box>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerSelect(e.target.value)}
          >
            {currentQuestion.choices.map((choice, index) => (
              <FormControlLabel
                key={index}
                value={choice}
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ 
                    fontSize: '1.1rem',
                    color: theme.palette.text.primary
                  }}>
                    {choice}
                  </Typography>
                }
                sx={{
                  margin: '12px 0',
                  padding: '16px',
                  border: `2px solid ${selectedAnswers[currentQuestionIndex] === choice 
                    ? theme.palette.primary.main 
                    : theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: selectedAnswers[currentQuestion.id] === choice 
                    ? `${theme.palette.primary.main}10` 
                    : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}05`
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Answer Feedback */}
        {showFeedback[currentQuestion.id] && selectedAnswers[currentQuestion.id] && (
          <Collapse in={showFeedback[currentQuestion.id]} timeout={300}>
            <Alert 
              severity={selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? 'success' : 'error'}
              sx={{ mt: 3, mb: 3 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                  ? '✅ Correct!' 
                  : '❌ Incorrect'
                }
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Your Answer:</strong> {selectedAnswers[currentQuestion.id]}
              </Typography>
              {selectedAnswers[currentQuestion.id] !== currentQuestion.correctAnswer && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Correct Answer:</strong> {currentQuestion.correctAnswer}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </Typography>
            </Alert>
          </Collapse>
        )}

        {/* Notes Section */}
        <Box sx={{ mt: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📝 Take Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your notes, thoughts, or key points about this question..."
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          {notes[currentQuestion.id] && (
            <Typography variant="caption" sx={{ mt: 1, color: theme.palette.text.secondary }}>
              Note saved for this question
            </Typography>
          )}
        </Box>
      </Box>

      {/* Navigation Buttons */}
      {!quizCompleted && (
        <Box sx={{ 
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            <Button
              variant="outlined"
              onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  disabled={!selectedAnswers[currentQuestion.id]}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleFinishQuiz}
                  disabled={answeredQuestions < questions.length || isSavingResult}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    bgcolor: theme.palette.success.main,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark
                    }
                  }}
                  startIcon={<CheckIcon />}
                >
                  {isSavingResult ? 'Saving Result...' : 'Finish Quiz'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Quiz Results */}
      {quizCompleted && (
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: theme.palette.success.main,
            mb: 3
          }}>
            🎉 Quiz Completed!
          </Typography>
          
          <Box sx={{ 
            p: 4, 
            bgcolor: theme.palette.action.hover, 
            borderRadius: 2,
            maxWidth: 600,
            width: '100%',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Results
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                  {questions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Total Questions
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  {questions.filter((question) => selectedAnswers[question.id] === question.correctAnswer).length}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Correct Answers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                  {Math.round((questions.filter((question) => selectedAnswers[question.id] === question.correctAnswer).length / questions.length) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Score
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
              setShowFeedback({});
              setNotes({});
            }}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Take Quiz Again
          </Button>

          {/* Notes Summary */}
          {Object.keys(notes).length > 0 && (
            <Box sx={{ mt: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxWidth: 800, width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                📝 Your Notes Summary
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {Object.entries(notes).map(([questionId, note]) => (
                  <Box key={questionId} sx={{ mb: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Question {questions.findIndex((question) => question.id === questionId) + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {note}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Quiz;
