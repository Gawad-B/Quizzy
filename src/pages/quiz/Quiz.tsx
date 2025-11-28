
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, FormControl, Chip, LinearProgress, TextField, Alert, Collapse } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Timer as TimerIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Sample quiz data - in real app this would come from API
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState<{ [key: number]: boolean }>({});
  
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the formula for calculating the area of a circle?",
      choices: [
        "A = πr²",
        "A = 2πr",
        "A = πd",
        "A = 2πd²"
      ],
      correctAnswer: "A = πr²",
      explanation: "The area of a circle is calculated using the formula A = πr², where r is the radius."
    },
    {
      id: 2,
      question: "Which of the following is a quadratic equation?",
      choices: [
        "2x + 3 = 7",
        "x² + 5x + 6 = 0",
        "3x - 2 = 10",
        "4x + 1 = 9"
      ],
      correctAnswer: "x² + 5x + 6 = 0",
      explanation: "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0."
    },
    {
      id: 3,
      question: "What is the value of sin(90°)?",
      choices: [
        "0",
        "1",
        "-1",
        "Undefined"
      ],
      correctAnswer: "1",
      explanation: "The sine of 90 degrees equals 1, as it represents the maximum value of the sine function."
    },
    {
      id: 4,
      question: "In a right triangle, if one angle is 30°, what is the other acute angle?",
      choices: [
        "45°",
        "60°",
        "90°",
        "120°"
      ],
      correctAnswer: "60°",
      explanation: "In a right triangle, the sum of the two acute angles is 90°. So if one is 30°, the other is 60°."
    },
    {
      id: 5,
      question: "What is the derivative of x³?",
      choices: [
        "x²",
        "2x²",
        "3x²",
        "3x"
      ],
      correctAnswer: "3x²",
      explanation: "The derivative of x³ is 3x², using the power rule: d/dx(xⁿ) = nxⁿ⁻¹."
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/create-quiz');
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
    // Show feedback immediately when answer is selected
    setShowFeedback(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }));
  };

  const handleQuestionNavigation = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
    // Hide feedback when navigating to a new question
    setShowFeedback(prev => ({
      ...prev,
      [newIndex]: false
    }));
  };

  const handleFinishQuiz = () => {
    setQuizCompleted(true);
  };

  const handleNoteChange = (note: string) => {
    setNotes(prev => ({
      ...prev,
      [currentQuestionIndex]: note
    }));
  };

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sampleQuestions.length) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;

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
            Question {currentQuestionIndex + 1} of {sampleQuestions.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${answeredQuestions}/${sampleQuestions.length} answered`}
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

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={selectedAnswers[currentQuestionIndex] || ''}
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
                  backgroundColor: selectedAnswers[currentQuestionIndex] === choice 
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
        {showFeedback[currentQuestionIndex] && selectedAnswers[currentQuestionIndex] && (
          <Collapse in={showFeedback[currentQuestionIndex]} timeout={300}>
            <Alert 
              severity={selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'success' : 'error'}
              sx={{ mt: 3, mb: 3 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer 
                  ? '✅ Correct!' 
                  : '❌ Incorrect'
                }
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Your Answer:</strong> {selectedAnswers[currentQuestionIndex]}
              </Typography>
              {selectedAnswers[currentQuestionIndex] !== currentQuestion.correctAnswer && (
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
            value={notes[currentQuestionIndex] || ''}
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
          {notes[currentQuestionIndex] && (
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
              {currentQuestionIndex < sampleQuestions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleFinishQuiz}
                  disabled={answeredQuestions < sampleQuestions.length}
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
                  Finish Quiz
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
                  {sampleQuestions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Total Questions
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  {Object.values(selectedAnswers).filter((answer, index) => 
                    answer === sampleQuestions[index].correctAnswer
                  ).length}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Correct Answers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                  {Math.round((Object.values(selectedAnswers).filter((answer, index) => 
                    answer === sampleQuestions[index].correctAnswer
                  ).length / sampleQuestions.length) * 100)}%
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
                {Object.entries(notes).map(([questionIndex, note]) => (
                  <Box key={questionIndex} sx={{ mb: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Question {parseInt(questionIndex) + 1}
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
