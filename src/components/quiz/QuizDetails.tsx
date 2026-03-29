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
  ListItemText,
  FormHelperText
} from '@mui/material';
import { School as SubjectIcon, Quiz as QuizIcon, Help as QuestionIcon } from '@mui/icons-material';

interface QuizDetailsProps {
  details: {
    subject: string;
    category: string;
    subcategory: string;
    quizName: string;
    questionCount: number;
  };
  onDetailsChange: (details: {
    subject: string;
    category: string;
    subcategory: string;
    quizName: string;
    questionCount: number;
  }) => void;
}

const QuizDetails: React.FC<QuizDetailsProps> = ({ details, onDetailsChange }) => {
  type SubjectDefinition = {
    name: string;
    categories: Record<string, string[]>;
  };

  // Subject taxonomy used for category/subcategory generation.
  const subjectsData: Record<string, SubjectDefinition> = {
    math: {
      name: 'Mathematics',
      categories: {
        Algebra: ['Linear Equations', 'Quadratic Expressions', 'Polynomials'],
        Geometry: ['Triangles', 'Circles', 'Coordinate Geometry'],
        Calculus: ['Limits', 'Derivatives', 'Integrals']
      }
    },
    science: {
      name: 'Science',
      categories: {
        Physics: ['Motion and Forces', 'Energy', 'Waves and Optics'],
        Chemistry: ['Atoms and Molecules', 'Chemical Reactions', 'Acids and Bases'],
        Biology: ['Cell Structure', 'Genetics', 'Ecosystems']
      }
    },
    history: {
      name: 'History',
      categories: {
        Ancient: ['Mesopotamia', 'Egypt', 'Ancient Greece'],
        Medieval: ['Feudalism', 'Crusades', 'Renaissance'],
        Modern: ['Industrial Revolution', 'World Wars', 'Cold War']
      }
    },
    literature: {
      name: 'Literature',
      categories: {
        Fiction: ['Narrative Voice', 'Plot Structure', 'Character Development'],
        Poetry: ['Imagery', 'Meter and Rhythm', 'Figurative Language'],
        Drama: ['Dialogue', 'Conflict', 'Stagecraft']
      }
    },
    geography: {
      name: 'Geography',
      categories: {
        Physical: ['Landforms', 'Climate Systems', 'Natural Resources'],
        Human: ['Population', 'Urbanization', 'Migration'],
        Economic: ['Trade Networks', 'Development', 'Globalization']
      }
    }
  };

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  useEffect(() => {
    if (!details.subject) {
      setAvailableCategories([]);
      setAvailableSubcategories([]);
      return;
    }

    const selectedSubject = subjectsData[details.subject];
    const categories = selectedSubject ? Object.keys(selectedSubject.categories) : [];
    setAvailableCategories(categories);

    if (!categories.includes(details.category)) {
      onDetailsChange({ ...details, category: '', subcategory: '' });
      setAvailableSubcategories([]);
      return;
    }

    const subcategories = selectedSubject.categories[details.category] || [];
    setAvailableSubcategories(subcategories);

    if (details.subcategory && !subcategories.includes(details.subcategory)) {
      onDetailsChange({ ...details, subcategory: '' });
    }
  }, [details.subject]);

  useEffect(() => {
    if (!details.subject || !details.category) {
      setAvailableSubcategories([]);
      return;
    }

    const selectedSubject = subjectsData[details.subject];
    if (!selectedSubject) {
      setAvailableSubcategories([]);
      return;
    }

    const subcategories = selectedSubject.categories[details.category] || [];
    setAvailableSubcategories(subcategories);
  }, [details.subject, details.category]);

  const handleSubjectChange = (subject: string) => {
    onDetailsChange({ ...details, subject, category: '', subcategory: '' });
  };

  const handleCategoryChange = (category: string) => {
    onDetailsChange({ ...details, category, subcategory: '' });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    onDetailsChange({ ...details, subcategory });
  };

  const handleQuizNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDetailsChange({ ...details, quizName: event.target.value });
  };

  const handleQuestionCountChange = (_event: Event, newValue: number | number[]) => {
    onDetailsChange({ ...details, questionCount: newValue as number });
  };

  const handleQuestionCountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 50) {
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
        <Grid size={{ xs: 12, md: 6 }}>
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={details.category}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={!details.subject}
              >
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <ListItemText primary={category} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a category based on your selected subject
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={details.subcategory}
                label="Subcategory"
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!details.category}
              >
                {availableSubcategories.map((subcategory) => (
                  <MenuItem key={subcategory} value={subcategory}>
                    <ListItemText primary={subcategory} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a subcategory for targeted question generation
              </FormHelperText>
            </FormControl>
          </Paper>
        </Grid>

        {/* Quiz Name & Questions */}
        <Grid size={{ xs: 12, md: 6 }}>
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
                max={50}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' }
                ]}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Custom Question Count"
                type="number"
                value={details.questionCount}
                onChange={handleQuestionCountInputChange}
                InputProps={{
                  inputProps: { min: 1, max: 50 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <QuestionIcon sx={{ fontSize: 20, color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter a value between 1-50"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary */}
      {details.subject && details.category && details.subcategory && details.quizName && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 4, bgcolor: 'success.light' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.dark' }}>
            Quiz Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Subject:</strong> {subjectsData[details.subject as keyof typeof subjectsData]?.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Category:</strong> {details.category}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Subcategory:</strong> {details.subcategory}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                <strong>Quiz Name:</strong> {details.quizName}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 12 }}>
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
