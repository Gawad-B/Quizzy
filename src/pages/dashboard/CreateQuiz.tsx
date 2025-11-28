import React, { useState } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, Button } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import QuizSettings from '../../components/quiz/QuizSettings';
import ExamModeSelector from '../../components/quiz/ExamModeSelector';
import QuizDetails from '../../components/quiz/QuizDetails';
import QuizPreview from '../../components/quiz/QuizPreview';

interface QuizData {
  settings: {
    isTimed: boolean;
    timeLimit?: number;
  };
  examMode: 'solved' | 'new' | 'bookmarked' | 'all';
  details: {
    subject: string;
    chapters: string[];
    quizName: string;
    questionCount: number;
  };
}

const CreateQuiz = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [quizData, setQuizData] = useState<QuizData>({
    settings: {
      isTimed: false,
      timeLimit: undefined
    },
    examMode: 'all',
    details: {
      subject: '',
      chapters: [],
      quizName: '',
      questionCount: 10
    }
  });

  const steps = [
    'Quiz Settings',
    'Exam Mode',
    'Quiz Details',
    'Preview & Generate'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSettingsChange = (settings: QuizData['settings']) => {
    setQuizData(prev => ({ ...prev, settings }));
  };

  const handleExamModeChange = (examMode: QuizData['examMode']) => {
    setQuizData(prev => ({ ...prev, examMode }));
  };

  const handleDetailsChange = (details: QuizData['details']) => {
    setQuizData(prev => ({ ...prev, details }));
  };

  const handleGenerateQuiz = () => {
    // Generate a random quiz ID
    const generateQuizId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `quiz_${timestamp}_${randomStr}`;
    };

    const quizId = generateQuizId();
    
    // In real app, this would call API to generate quiz
    console.log('Generating quiz with:', quizData);
    console.log('Generated Quiz ID:', quizId);
    
    // Navigate to the quiz page
    navigate(`/quiz/${quizId}`);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <QuizSettings
            settings={quizData.settings}
            onSettingsChange={handleSettingsChange}
          />
        );
      case 1:
        return (
          <ExamModeSelector
            examMode={quizData.examMode}
            onExamModeChange={handleExamModeChange}
          />
        );
      case 2:
        return (
          <QuizDetails
            details={quizData.details}
            onDetailsChange={handleDetailsChange}
          />
        );
      case 3:
        return (
          <QuizPreview
            quizData={quizData}
            onGenerate={handleGenerateQuiz}
          />
        );
      default:
        return null;
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return true; // Settings are always valid
      case 1:
        return quizData.examMode !== undefined;
      case 2:
        return Boolean(quizData.details.subject) && 
               quizData.details.chapters.length > 0 && 
               Boolean(quizData.details.quizName) && 
               quizData.details.questionCount > 0;
      case 3:
        return true; // Preview step is always valid
      default:
        return false;
    }
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
          Create New Quiz 🧩
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 400
        }}>
          Generate personalized quizzes with custom settings and content
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                StepIconProps={{
                  sx: {
                    color: index <= activeStep ? theme.palette.primary.main : theme.palette.action.disabled
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4, minHeight: '400px' }}>
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2,
            minWidth: '120px'
          }}
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                minWidth: '120px'
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleGenerateQuiz}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                minWidth: '120px',
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark
                }
              }}
            >
              Generate Quiz
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateQuiz;