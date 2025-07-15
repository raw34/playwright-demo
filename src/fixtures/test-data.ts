export interface User {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export const validUsers: User[] = [
  {
    username: 'testuser1',
    password: 'password123',
    email: 'testuser1@example.com',
    fullName: 'Test User One',
  },
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    fullName: 'Admin User',
  },
];

export const invalidUsers = {
  wrongPassword: {
    username: 'testuser1',
    password: 'wrongpassword',
  },
  nonexistentUser: {
    username: 'nonexistent',
    password: 'password123',
  },
  emptyCredentials: {
    username: '',
    password: '',
  },
};

export const testUrls = {
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
};