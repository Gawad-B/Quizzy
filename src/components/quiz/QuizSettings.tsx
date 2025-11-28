import React from 'react';
import { Box, Typography, FormControlLabel, Switch, TextField, Grid, Paper } from '@mui/material';
import { Timer as TimerIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';

interface QuizSettingsProps {
  settings: {
    isTimed: boolean;
    timeLimit?: number;
  };
  onSettingsChange: (settings: { isTimed: boolean; timeLimit?: number }) => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ settings, onSettingsChange }) => {
  const handleTimedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isTimed = event.target.checked;
    onSettingsChange({
      isTimed,
      timeLimit: isTimed ? settings.timeLimit || 30 : undefined
    });
  };

  const handleTimeLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeLimit = parseInt(event.target.value);
    if (!isNaN(timeLimit) && timeLimit > 0) {
      onSettingsChange({
        ...settings,
        timeLimit
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <TimerIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quiz Settings
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Timed Quiz Toggle */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AccessTimeIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Time Settings
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.isTimed}
                  onChange={handleTimedChange}
                  color="primary"
                  size="large"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Timed Quiz
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Set a time limit for the entire quiz
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            {settings.isTimed && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  label="Time Limit (minutes)"
                  type="number"
                  value={settings.timeLimit || ''}
                  onChange={handleTimeLimitChange}
                  InputProps={{
                    inputProps: { min: 1, max: 300 }
                  }}
                  fullWidth
                  helperText="Enter time limit between 1-300 minutes"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Settings Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Settings Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: settings.isTimed ? 'success.main' : 'warning.main' 
                }} />
                <Typography variant="body2">
                  {settings.isTimed 
                    ? `Quiz will be timed with ${settings.timeLimit || 30} minute limit`
                    : 'Quiz will have no time limit'
                  }
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'info.main' 
                }} />
                <Typography variant="body2">
                  You can modify these settings later before generating the quiz
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main' 
                }} />
                <Typography variant="body2">
                  Time settings affect quiz difficulty and user experience
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuizSettings;
