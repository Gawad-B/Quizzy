import { MOCK_USERS, delay } from './mockData';
import type { User } from './mockData';

export const userAPI = {
  getById: async (id: string): Promise<User> => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.id === id || u.email === id); // simple mock lookup

    if (!user) {
      throw new Error("Failed to fetch user");
    }

    return user;
  }
};
