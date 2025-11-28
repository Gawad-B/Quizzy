import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Paper,
  Slider,
  InputAdornment,
  Checkbox,
  ListItemText,
  FormHelperText,
  Chip
} from '@mui/material';
import { School as SubjectIcon, Book as ChapterIcon, Quiz as QuizIcon, Help as QuestionIcon } from '@mui/icons-material';

interface QuizDetailsProps {
  details: {
    subject: string;
    chapters: string[];
    quizName: string;
    questionCount: number;
  };
  onDetailsChange: (details: { subject: string; chapters: string[]; quizName: string; questionCount: number }) => void;
}

const QuizDetails: React.FC<QuizDetailsProps> = ({ details, onDetailsChange }) => {
  // Mock data for subjects and chapters - in real app this would come from API
  const subjectsData = {
    math: {
      name: 'Mathematics',
      chapters: [
        'Algebra Basics',
        'Linear Equations',
        'Quadratic Functions',
        'Geometry',
        'Trigonometry',
        'Calculus Intro'
      ]
    },
    science: {
      name: 'Science',
      chapters: [
        'Physics Fundamentals',
        'Chemistry Basics',
        'Biology Systems',
        'Earth Science'
      ]
    },
    history: {
      name: 'History',
      chapters: [
        'Ancient Civilizations',
        'Medieval Period',
        'Modern History',
        'World Wars'
      ]
    },
    literature: {
      name: 'Literature',
      chapters: [
        'Classic Novels',
        'Poetry Analysis',
        'Shakespeare',
        'Modern Literature'
      ]
    },
    geography: {
      name: 'Geography',
      chapters: [
        'World Geography',
        'Physical Geography',
        'Human Geography',
        'Economic Geography'
      ]
    }
  };

  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  useEffect(() => {
    if (details.subject) {
      const chapters = subjectsData[details.subject as keyof typeof subjectsData]?.chapters || [];
      setAvailableChapters(chapters);
      // Reset chapters if current selections are not available in new subject
      const validChapters = details.chapters.filter(chapter => chapters.includes(chapter));
      if (validChapters.length !== details.chapters.length) {
        onDetailsChange({ ...details, chapters: validChapters });
      }
    } else {
      setAvailableChapters([]);
    }
  }, [details.subject]);

  const handleSubjectChange = (subject: string) => {
    onDetailsChange({ ...details, subject, chapters: [] });
  };

  const handleChapterChange = (chapters: string[]) => {
    onDetailsChange({ ...details, chapters });
  };

  const handleQuizNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDetailsChange({ ...details, quizName: event.target.value });
  };

  const handleQuestionCountChange = (event: Event, newValue: number | number[]) => {
    onDetailsChange({ ...details, questionCount: newValue as number });
  };

  const handleQuestionCountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      onDetailsChange({ ...details, questionCount: value });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <QuizIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quiz Details
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Configure the basic information for your quiz including subject, chapter, and question count.
      </Typography>

      <Grid container spacing={4}>
        {/* Subject Selection */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SubjectIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Subject & Chapter
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={details.subject}
                label="Subject"
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                {Object.entries(subjectsData).map(([key, subject]) => (
                  <MenuItem key={key} value={key}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Chapters</InputLabel>
              <Select
                multiple
                value={details.chapters}
                label="Chapters"
                onChange={(e) => handleChapterChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                disabled={!details.subject}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableChapters.map((chapter) => (
                  <MenuItem key={chapter} value={chapter}>
                    <Checkbox checked={details.chapters.indexOf(chapter) > -1} />
                    <ListItemText primary={chapter} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select one or more chapters for your quiz
              </FormHelperText>
            </FormControl>
          </Paper>
        </Grid>

        {/* Quiz Name & Questions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <QuizIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quiz Configuration
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Quiz Name"
              value={details.quizName}
              onChange={handleQuizNameChange}
              placeholder="Enter a descriptive name for your quiz"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuizIcon sx={{ fontSize: 20, color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Number of Questions: {details.questionCount}
              </Typography>
              <Slider
                value={details.questionCount}
                onChange={handleQuestionCountChange}
                min={1}
                max={100}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 75, label: '75' },
                  { value: 100, label: '100' }
                ]}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Custom Question Count"
                type="number"
                value={details.questionCount}
                onChange={handleQuestionCountInputChange}
                InputProps={{
                  inputProps: { min: 1, max: 100 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <QuestionIcon sx={{ fontSize: 20, color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter a value between 1-100"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary */}
      {details.subject && details.chapters.length > 0 && details.quizName && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 4, bgcolor: 'success.light' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.dark' }}>
            Quiz Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Subject:</strong> {subjectsData[details.subject as keyof typeof subjectsData]?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Chapters:</strong> {details.chapters.join(', ')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Quiz Name:</strong> {details.quizName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Questions:</strong> {details.questionCount}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default QuizDetails;
