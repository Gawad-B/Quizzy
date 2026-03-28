import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/userService';

export const useOverviewQuery = () => {
  return useQuery({
    queryKey: ['overview', 'me'],
    queryFn: () => userAPI.getOverview('me'),
    retry: false,
    staleTime: 60 * 1000,
  });
};
