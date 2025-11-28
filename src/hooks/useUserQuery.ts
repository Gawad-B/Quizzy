import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../services/userService";
import type { User } from "../services/mockData";

export const useUserQuery = (userId: string | undefined) => {
  return useQuery<User | null>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        const data = await userAPI.getById(userId);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch user with id: ${userId}`);
      }
    },
    enabled: !!userId,
  });
};
