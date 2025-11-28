export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    grade?: string;
    graduation_year?: string;
    nationality?: string;
    university?: string;
    profile_image?: string;
    created_at?: string;
}

export const MOCK_USERS: User[] = [
    {
        id: '1',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        grade: 'A',
        graduation_year: '2025',
        nationality: 'US',
        university: 'Test University',
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        grade: 'B',
        graduation_year: '2024',
        nationality: 'UK',
        university: 'Mock University',
        created_at: new Date().toISOString(),
    }
];

export interface Quiz {
    id: string;
    title: string;
    subject: string;
    date: string;
    score: number;
    totalQuestions: number;
    status: 'Finished' | 'Unfinished';
    image: string;
}

export const MOCK_QUIZ_HISTORY: Quiz[] = [
    {
        id: '1',
        title: 'Calculus Midterm',
        subject: 'Mathematics',
        date: '2023-10-15',
        score: 85,
        totalQuestions: 20,
        status: 'Finished',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
        id: '2',
        title: 'Organic Chemistry Basics',
        subject: 'Chemistry',
        date: '2023-10-18',
        score: 0,
        totalQuestions: 15,
        status: 'Unfinished',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
        id: '3',
        title: 'World History: WWII',
        subject: 'History',
        date: '2023-10-20',
        score: 92,
        totalQuestions: 25,
        status: 'Finished',
        image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
        id: '4',
        title: 'Physics: Mechanics',
        subject: 'Physics',
        date: '2023-10-22',
        score: 78,
        totalQuestions: 10,
        status: 'Finished',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
        id: '5',
        title: 'English Literature',
        subject: 'English',
        date: '2023-10-25',
        score: 0,
        totalQuestions: 30,
        status: 'Unfinished',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300&h=200'
    }
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
