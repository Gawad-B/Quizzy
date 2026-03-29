import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import SubjectSelector from '../../components/analysis/SubjectSelector';
import ChapterAnalytics from '../../components/analysis/ChapterAnalytics';
import PerformanceCharts from '../../components/analysis/PerformanceCharts';
import { useSubjectAnalysisQuery, useSubjectsQuery } from '../../hooks/useSubjectAnalysisQuery';

const Analysis = () => {
  const { theme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const { data: subjectsData = [], isLoading: subjectsLoading } = useSubjectsQuery();
  const { data: analysisData, isLoading: analysisLoading } = useSubjectAnalysisQuery(selectedSubject || undefined);

  const colorCycle = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const subjects = subjectsData.map((subject, index) => ({
    id: subject.id,
    name: subject.name,
    color: colorCycle[index % colorCycle.length],
  }));

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  return (
    <Box className="dashboard-page" sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700, 
          color: theme.palette.text.primary,
          mb: 1,
          fontSize: { xs: '1.8rem', sm: '2.15rem', md: '2.8rem' }
        }}>
          Detailed Analytics 📊
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 400,
          fontSize: { xs: '0.98rem', sm: '1.05rem', md: '1.2rem' }
        }}>
          Deep dive into your performance by subject and category
        </Typography>
      </Box>

      {/* Subject Selection */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, mb: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Select Subject
        </Typography>
        {subjectsLoading ? (
          <Typography sx={{ color: theme.palette.text.secondary }}>Loading subjects...</Typography>
        ) : (
        <SubjectSelector 
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
        />
        )}
      </Paper>

      {/* Analytics Content */}
      {selectedSubject && (
        <>
          {/* Category Analytics */}
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, mb: { xs: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Category Performance Breakdown
            </Typography>
            {analysisLoading ? (
              <Typography sx={{ color: theme.palette.text.secondary }}>Loading category analytics...</Typography>
            ) : (
              <ChapterAnalytics chapters={analysisData?.chapters ?? []} />
            )}
          </Paper>

          {/* Performance Charts */}
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Performance Trends & Insights
            </Typography>
            {analysisLoading ? (
              <Typography sx={{ color: theme.palette.text.secondary }}>Loading performance insights...</Typography>
            ) : (
              <PerformanceCharts
                subjectId={selectedSubject}
                performance={analysisData?.performance ?? {
                  overallScore: 0,
                  strongAreas: [],
                  weakAreas: [],
                  questionTypes: {},
                }}
              />
            )}
          </Paper>
        </>
      )}

      {/* No Subject Selected State */}
      {!selectedSubject && (
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4, md: 6 }, borderRadius: 3, textAlign: 'center' }}>
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