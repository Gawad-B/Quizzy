import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as SolvedIcon,
  AddCircle as NewIcon,
  Bookmark as BookmarkedIcon,
  AllInclusive as AllIcon,
  School as SubjectIcon,
  Book as ChapterIcon,
  Quiz as QuizIcon,
  Help as QuestionIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface QuizPreviewProps {
  quizData: {
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
  };
  onGenerate: () => void;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quizData, onGenerate }) => {
  const subjectsData = {
    math: 'Mathematics',
    science: 'Science',
    history: 'History',
    literature: 'Literature',
    geography: 'Geography'
  };

  const examModeData = {
    solved: { title: 'Previously Solved', icon: <SolvedIcon />, color: '#4caf50' },
    new: { title: 'New Questions', icon: <NewIcon />, color: '#2196f3' },
    bookmarked: { title: 'Bookmarked', icon: <BookmarkedIcon />, color: '#ff9800' },
    all: { title: 'Mixed Questions', icon: <AllIcon />, color: '#9c27b0' }
  };

  const getExamModeInfo = () => examModeData[quizData.examMode];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <InfoIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quiz Preview & Generation
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Review your quiz configuration before generating. Make sure all settings are correct.
      </Typography>

      {/* Quiz Configuration Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: 'primary.main' }} />
              Quiz Settings
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TimerIcon sx={{ color: quizData.settings.isTimed ? 'success.main' : 'warning.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Timed Quiz"
                  secondary={quizData.settings.isTimed ? 'Yes' : 'No'}
                />
                <Chip 
                  label={quizData.settings.isTimed ? 'Timed' : 'Untimed'} 
                  color={quizData.settings.isTimed ? 'success' : 'warning'}
                  size="small"
                />
              </ListItem>
              
              {quizData.settings.isTimed && (
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon sx={{ color: 'info.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time Limit"
                    secondary={`${quizData.settings.timeLimit || 30} minutes`}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Exam Mode */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              {getExamModeInfo().icon}
              Exam Mode
            </Typography>
            
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ 
                fontSize: 48, 
                color: getExamModeInfo().color,
                mb: 2,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {getExamModeInfo().icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {getExamModeInfo().title}
              </Typography>
              <Chip 
                label={getExamModeInfo().title} 
                sx={{ 
                  bgcolor: getExamModeInfo().color, 
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quiz Details */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuizIcon sx={{ color: 'primary.main' }} />
          Quiz Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <SubjectIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Subject
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                {subjectsData[quizData.details.subject as keyof typeof subjectsData]}
              </Typography>
            </Box>
          </Grid>
          
                     <Grid item xs={12} sm={6} md={3}>
             <Box sx={{ textAlign: 'center', p: 2 }}>
               <ChapterIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 Chapters
               </Typography>
               <Typography variant="body1" sx={{ color: 'text.primary' }}>
                 {quizData.details.chapters.join(', ')}
               </Typography>
             </Box>
           </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <QuizIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Quiz Name
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                {quizData.details.quizName}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <QuestionIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Questions
              </Typography>
              <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 700 }}>
                {quizData.details.questionCount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Generation Info */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Ready to generate!</strong> Your quiz will be created with the selected settings. 
          The system will automatically select questions based on your preferences and generate a 
          unique quiz experience.
        </Typography>
      </Alert>

      {/* Estimated Stats */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Estimated Quiz Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Estimated Duration:</strong> {quizData.settings.isTimed 
                ? `${quizData.settings.timeLimit || 30} minutes`
                : `${Math.ceil(quizData.details.questionCount * 2)} minutes (estimated)`
              }
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Difficulty:</strong> Mixed (based on your performance)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Question Types:</strong> Multiple choice, problem solving
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Progress Tracking:</strong> Enabled
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuizPreview;
