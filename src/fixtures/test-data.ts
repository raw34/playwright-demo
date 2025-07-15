// GitHub API 测试数据
export const gitHubTestData = {
  searchQueries: {
    popular: 'playwright',
    language: 'typescript',
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
  },
  
  expectedResults: {
    minStars: 500,
    minForks: 50,
    maxSearchResults: 10,
  },
};

// 基础演示测试数据
export const demoTestData = {
  loginCredentials: {
    valid: {
      username: 'tomsmith',
      password: 'SuperSecretPassword!',
    },
    invalid: {
      username: 'invalid',
      password: 'wrongpassword',
    },
  },
  
  testUrls: {
    example: 'https://example.com',
    loginDemo: 'https://the-internet.herokuapp.com/login',
    httpbin: 'https://httpbin.org',
    github: 'https://github.com',
  },
};