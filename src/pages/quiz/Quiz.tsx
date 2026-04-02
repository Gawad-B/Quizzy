
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, FormControl, Chip, LinearProgress, TextField, Alert, Collapse, CircularProgress } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, CollectionsBookmark as CollectionsBookmarkIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/userService';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const locationState = (location.state as { isTimed?: boolean; timeLimitMinutes?: number } | null) ?? null;

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
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isTimedQuiz, setIsTimedQuiz] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [didTimeout, setDidTimeout] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});
  const quizStartedAtRef = useRef<number>(Date.now());
  const questionStartedAtRef = useRef<number>(Date.now());
  const autoSubmitTriggeredRef = useRef(false);

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

        const backendTimed = Boolean(response.quiz?.isTimed);
        const backendTimeLimitSeconds = response.quiz?.timeLimitSeconds ?? null;
        const fallbackTimed = Boolean(locationState?.isTimed);
        const fallbackTimeLimitSeconds = locationState?.timeLimitMinutes
          ? Math.round(locationState.timeLimitMinutes * 60)
          : null;
        const resolvedIsTimed = backendTimed || fallbackTimed;
        const resolvedTimeLimitSeconds = resolvedIsTimed
          ? (backendTimeLimitSeconds ?? fallbackTimeLimitSeconds ?? 30 * 60)
          : null;

        setIsTimedQuiz(resolvedIsTimed);
        setTimeLimitSeconds(resolvedTimeLimitSeconds);
        setSecondsRemaining(resolvedTimeLimitSeconds);
        setDidTimeout(false);
        setIsInteractionLocked(false);
        autoSubmitTriggeredRef.current = false;

        quizStartedAtRef.current = Date.now();
        questionStartedAtRef.current = Date.now();
        setQuestionTimeSpent({});
      } catch (error) {
        console.error(error);
        setLoadError('Failed to load quiz questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    void loadQuizQuestions();
  }, [quizId, locationState?.isTimed, locationState?.timeLimitMinutes]);

  const formatRemainingTime = (totalSeconds: number) => {
    const safeTotal = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeTotal / 60);
    const seconds = safeTotal % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleBackToDashboard = () => {
    navigate('/create-quiz');
  };

  const handleAnswerSelect = (answer: string) => {
    if (isInteractionLocked || didTimeout) {
      return;
    }

    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) {
      return;
    }

    if (selectedAnswers[questionId]) {
      return;
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const recordTimeForQuestion = (questionId?: string) => {
    if (!questionId) {
      return;
    }

    const elapsedMs = Date.now() - questionStartedAtRef.current;
    const elapsedSeconds = Math.max(0, Math.round(elapsedMs / 1000));

    setQuestionTimeSpent((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + elapsedSeconds,
    }));

    questionStartedAtRef.current = Date.now();
  };

  const handleQuestionNavigation = (newIndex: number) => {
    if (isInteractionLocked || didTimeout) {
      return;
    }

    const currentQuestionId = questions[currentQuestionIndex]?.id;
    recordTimeForQuestion(currentQuestionId);

    setCurrentQuestionIndex(newIndex);
  };

  const handleFinishQuiz = async (timedOut = false) => {
    if (isSavingResult || quizCompleted) {
      return;
    }

    setIsInteractionLocked(true);
    setIsSavingResult(true);

    const currentQuestionId = questions[currentQuestionIndex]?.id;
    const elapsedMs = Date.now() - questionStartedAtRef.current;
    const elapsedSecondsForCurrent = Math.max(0, Math.round(elapsedMs / 1000));
    const finalQuestionTimeSpent = {
      ...questionTimeSpent,
      ...(currentQuestionId
        ? { [currentQuestionId]: (questionTimeSpent[currentQuestionId] || 0) + elapsedSecondsForCurrent }
        : {}),
    };

    const totalElapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - quizStartedAtRef.current) / 1000)
    );

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
          status: timedOut ? 'Timed Out' : 'Finished',
          score: calculatedScore,
          durationSeconds: totalElapsedSeconds,
          attempts: questions.map((question) => ({
            questionId: question.id,
            selectedAnswer: selectedAnswers[question.id],
            timeSpentSeconds: finalQuestionTimeSpent[question.id] || 0,
          })),
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
    if (isInteractionLocked || didTimeout) {
      return;
    }

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
    if (isInteractionLocked || didTimeout) {
      return;
    }

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

  useEffect(() => {
    if (!isTimedQuiz || quizCompleted || isSavingResult || isLoadingQuestions || !questions.length) {
      return;
    }

    if (secondsRemaining === null) {
      return;
    }

    if (secondsRemaining <= 0) {
      if (!autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        setDidTimeout(true);
        setIsInteractionLocked(true);
        void handleFinishQuiz(true);
      }
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) {
          return prev;
        }

        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    isTimedQuiz,
    quizCompleted,
    isSavingResult,
    isLoadingQuestions,
    questions.length,
    secondsRemaining,
  ]);

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

  if (!currentQuestion) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to display this quiz question. Please restart the quiz.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/create-quiz')}>
          Back to Create Quiz
        </Button>
      </Box>
    );
  }

  const currentAnswer = selectedAnswers[currentQuestion.id];
  const isCurrentQuestionAnswered = Boolean(currentAnswer);
  const isCurrentQuestionCorrect = isCurrentQuestionAnswered && currentAnswer === currentQuestion.correctAnswer;

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
        {isTimedQuiz && secondsRemaining !== null && !quizCompleted && (
          <Alert
            icon={<AccessTimeIcon />}
            severity={secondsRemaining <= 60 ? 'error' : secondsRemaining <= 300 ? 'warning' : 'info'}
            sx={{ mb: 2 }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              Time Left: {formatRemainingTime(secondsRemaining)}
            </Typography>
          </Alert>
        )}

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
              {isTimedQuiz && timeLimitSeconds && (
                <Chip
                  label={`Timed: ${Math.round(timeLimitSeconds / 60)} min`}
                  color="warning"
                  variant="outlined"
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
            {currentQuestion.choices.map((choice, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === choice;
                const isCorrectChoice = choice === currentQuestion.correctAnswer;
                const showCorrectState = isCurrentQuestionAnswered && isCorrectChoice;
                const showWrongState = isCurrentQuestionAnswered && isSelected && !isCorrectChoice;

                return (
              <FormControlLabel
                key={index}
                value={choice}
                disabled={isCurrentQuestionAnswered || isInteractionLocked}
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
                  border: `2px solid ${showCorrectState
                    ? theme.palette.success.main
                    : showWrongState
                      ? theme.palette.error.main
                      : isSelected
                        ? theme.palette.primary.main
                        : theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: showCorrectState
                    ? `${theme.palette.success.main}15`
                    : showWrongState
                      ? `${theme.palette.error.main}15`
                      : isSelected
                        ? `${theme.palette.primary.main}10`
                        : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: isCurrentQuestionAnswered ? undefined : theme.palette.primary.main,
                    backgroundColor: isCurrentQuestionAnswered ? undefined : `${theme.palette.primary.main}05`
                  }
                }}
              />
                );
              })}
          </RadioGroup>
        </FormControl>

        {/* Answer Feedback */}
        {isCurrentQuestionAnswered && (
          <Collapse in={isCurrentQuestionAnswered} timeout={300}>
            <Alert 
              severity={isCurrentQuestionCorrect ? 'success' : 'error'}
              sx={{ mt: 3, mb: 3 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {isCurrentQuestionCorrect
                  ? 'Correct' 
                  : 'Incorrect'
                }
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Your Answer:</strong> {currentAnswer}
              </Typography>
              {!isCurrentQuestionCorrect && (
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
            Take Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your notes, thoughts, or key points about this question..."
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            disabled={isInteractionLocked}
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
              disabled={currentQuestionIndex === 0 || isInteractionLocked}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  disabled={!selectedAnswers[currentQuestion.id] || isInteractionLocked}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleFinishQuiz();
                  }}
                  disabled={answeredQuestions < questions.length || isSavingResult || isInteractionLocked}
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
            color: didTimeout ? theme.palette.error.main : theme.palette.success.main,
            mb: 3
          }}>
            {didTimeout ? 'Quiz Timed Out' : 'Quiz Completed'}
          </Typography>

          {didTimeout && (
            <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
              Time expired. Unanswered questions were marked as wrong and this attempt was saved as Timed Out.
            </Alert>
          )}
          
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

            {didTimeout && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Unanswered: {questions.length - answeredQuestions}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
              setNotes({});
              setQuestionTimeSpent({});
              setDidTimeout(false);
              setIsInteractionLocked(false);
              autoSubmitTriggeredRef.current = false;
              setSecondsRemaining(isTimedQuiz ? timeLimitSeconds : null);
              quizStartedAtRef.current = Date.now();
              questionStartedAtRef.current = Date.now();
            }}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Take Quiz Again
          </Button>

          {/* Notes Summary */}
          {Object.keys(notes).length > 0 && (
            <Box sx={{ mt: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxWidth: 800, width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Your Notes Summary
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
