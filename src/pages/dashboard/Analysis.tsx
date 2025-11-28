import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import SubjectSelector from '../../components/analysis/SubjectSelector';
import ChapterAnalytics from '../../components/analysis/ChapterAnalytics';
import PerformanceCharts from '../../components/analysis/PerformanceCharts';

const Analysis = () => {
  const { theme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Mock data for subjects
  const subjects = [
    { id: 'math', name: 'Mathematics', color: theme.palette.primary.main },
    { id: 'science', name: 'Science', color: theme.palette.success.main },
    { id: 'history', name: 'History', color: theme.palette.info.main },
    { id: 'literature', name: 'Literature', color: theme.palette.warning.main },
    { id: 'geography', name: 'Geography', color: theme.palette.error.main },
  ];

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
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
          Detailed Analytics 📊
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 400
        }}>
          Deep dive into your performance by subject and chapter
        </Typography>
      </Box>

      {/* Subject Selection */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Select Subject
        </Typography>
        <SubjectSelector 
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
        />
      </Paper>

      {/* Analytics Content */}
      {selectedSubject && (
        <>
          {/* Chapter Analytics */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Chapter Performance Breakdown
            </Typography>
            <ChapterAnalytics subjectId={selectedSubject} />
          </Paper>

          {/* Performance Charts */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Performance Trends & Insights
            </Typography>
            <PerformanceCharts subjectId={selectedSubject} />
          </Paper>
        </>
      )}

      {/* No Subject Selected State */}
      {!selectedSubject && (
        <Paper elevation={2} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ 
            color: theme.palette.text.secondary,
            mb: 2
          }}>
            📚 Select a subject above to view detailed analytics
          </Typography>
          <Typography variant="body1" sx={{ 
            color: theme.palette.text.disabled
          }}>
            Choose from Mathematics, Science, History, Literature, or Geography to explore your performance data
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Analysis;