import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { School as SubjectIcon } from '@mui/icons-material';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ 
  subjects, 
  selectedSubject, 
  onSubjectChange 
}) => {
  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
      gap: 2 
    }}>
      {subjects.map((subject) => (
        <Card
          key={subject.id}
          onClick={() => onSubjectChange(subject.id)}
          sx={{
            cursor: 'pointer',
            border: `2px solid ${selectedSubject === subject.id ? subject.color : 'transparent'}`,
            backgroundColor: selectedSubject === subject.id ? `${subject.color}10` : 'transparent',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
              borderColor: subject.color,
              backgroundColor: `${subject.color}15`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <SubjectIcon sx={{ 
                fontSize: 40, 
                color: subject.color 
              }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: selectedSubject === subject.id ? subject.color : 'inherit'
            }}>
              {subject.name}
            </Typography>
            {selectedSubject === subject.id && (
              <Chip 
                label="Selected" 
                size="small" 
                sx={{ 
                  bgcolor: subject.color, 
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SubjectSelector;
