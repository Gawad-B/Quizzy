import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Bookmark as BookmarkIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { userAPI } from '../../services/userService';

interface BookmarkItem {
  id: string;
  question: string;
  explanation?: string | null;
  category?: string | null;
  subcategory?: string | null;
  subject?: string | null;
  bookmarked_at?: string;
}

const Bookmarks = () => {
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subjectFilter, setSubjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');

  const fetchBookmarks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.getBookmarkedQuestions({
        subject: subjectFilter || undefined,
        category: categoryFilter || undefined,
        subcategory: subcategoryFilter || undefined,
      });
      setBookmarks(response.bookmarks || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Failed to load bookmarks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBookmarks();
  }, []);

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(bookmarks.map((item) => item.subject).filter(Boolean))).sort() as string[];
  }, [bookmarks]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(bookmarks.map((item) => item.category).filter(Boolean))).sort() as string[];
  }, [bookmarks]);

  const subcategoryOptions = useMemo(() => {
    return Array.from(new Set(bookmarks.map((item) => item.subcategory).filter(Boolean))).sort() as string[];
  }, [bookmarks]);

  const removeBookmark = async (questionId: string) => {
    try {
      await userAPI.setQuestionBookmark(questionId, false);
      setBookmarks((prev) => prev.filter((item) => item.id !== questionId));
    } catch (bookmarkError) {
      console.error(bookmarkError);
      window.alert('Could not remove bookmark right now.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bookmarked Questions
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Review and practice the questions you marked as important.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBookmarks}>
          Refresh
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Filter Bookmarks
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Subject"
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {subjectOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Subcategory"
              value={subcategoryFilter}
              onChange={(event) => setSubcategoryFilter(event.target.value)}
            >
              <MenuItem value="">All Subcategories</MenuItem>
              {subcategoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={fetchBookmarks}>
            Apply Filters
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setSubjectFilter('');
              setCategoryFilter('');
              setSubcategoryFilter('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2">Loading bookmarks...</Typography>
        </Box>
      )}

      {!isLoading && bookmarks.length === 0 && (
        <Alert severity="info">No bookmarked questions found for the selected filters.</Alert>
      )}

      {!isLoading && bookmarks.length > 0 && (
        <Grid container spacing={2}>
          {bookmarks.map((bookmark) => (
            <Grid size={{ xs: 12 }} key={bookmark.id}>
              <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {bookmark.subject && <Chip size="small" label={bookmark.subject} color="primary" variant="outlined" />}
                    {bookmark.category && <Chip size="small" label={bookmark.category} color="info" variant="outlined" />}
                    {bookmark.subcategory && <Chip size="small" label={bookmark.subcategory} color="secondary" variant="outlined" />}
                  </Box>
                  <Button
                    color="warning"
                    variant="text"
                    startIcon={<BookmarkIcon />}
                    onClick={() => removeBookmark(bookmark.id)}
                  >
                    Remove Bookmark
                  </Button>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {bookmark.question}
                </Typography>

                {bookmark.explanation && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {bookmark.explanation}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Bookmarks;
