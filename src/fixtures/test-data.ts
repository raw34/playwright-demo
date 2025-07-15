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

// GitHub 测试数据
export const gitHubTestData = {
  searchQueries: {
    popular: 'playwright',
    specific: 'microsoft/playwright',
    language: 'typescript',
    trending: 'react',
  },
  
  repositories: {
    playwright: {
      owner: 'microsoft',
      name: 'playwright',
      fullName: 'microsoft/playwright',
      expectedLanguages: ['TypeScript', 'JavaScript'],
      hasReadme: true,
    },
    
    react: {
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      expectedLanguages: ['JavaScript'],
      hasReadme: true,
    },
    
    vue: {
      owner: 'vuejs',
      name: 'vue',
      fullName: 'vuejs/vue',
      expectedLanguages: ['TypeScript', 'JavaScript'],
      hasReadme: true,
    },
  },
  
  expectedResults: {
    minStars: 1000,
    minForks: 100,
    maxSearchResults: 10,
  },
};