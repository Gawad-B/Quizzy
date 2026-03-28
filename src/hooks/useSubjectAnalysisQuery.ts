import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/userService';

export const useSubjectsQuery = () => {
  return useQuery({
    queryKey: ['subjects', 'me'],
    queryFn: () => userAPI.getSubjects('me'),
    retry: false,
    staleTime: 60 * 1000,
  });
};

export const useSubjectAnalysisQuery = (subjectId?: string) => {
  return useQuery({
    queryKey: ['analysis', 'me', subjectId],
    queryFn: () => userAPI.getAnalysisBySubject(subjectId as string, 'me'),
    enabled: Boolean(subjectId),
    retry: false,
    staleTime: 60 * 1000,
  });
};
