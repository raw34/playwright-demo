/**
 * GitHub 测试数据
 * 包含 GitHub 网站和 API 测试相关的数据配置
 */

export const gitHubTestData = {
  baseUrl: 'https://github.com',

  searchQueries: {
    popular: 'playwright',
    language: 'typescript',
    framework: 'react',
    topic: 'machine-learning',
    user: 'microsoft',
    organization: 'facebook',
  },

  repositories: {
    playwright: {
      owner: 'microsoft',
      name: 'playwright',
      fullName: 'microsoft/playwright',
      expectedLanguages: ['TypeScript', 'JavaScript'],
      hasReadme: true,
      isPublic: true,
      hasIssues: true,
      hasPullRequests: true,
      hasWiki: true,
      hasReleases: true,
      description: 'Playwright is a framework for Web Testing and Automation',
    },

    react: {
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      expectedLanguages: ['JavaScript', 'TypeScript'],
      hasReadme: true,
      isPublic: true,
      hasIssues: true,
      hasPullRequests: true,
      hasWiki: false,
      hasReleases: true,
      description: 'The library for web and native user interfaces',
    },

    vscode: {
      owner: 'microsoft',
      name: 'vscode',
      fullName: 'microsoft/vscode',
      expectedLanguages: ['TypeScript', 'JavaScript'],
      hasReadme: true,
      isPublic: true,
      hasIssues: true,
      hasPullRequests: true,
      hasWiki: true,
      hasReleases: true,
      description: 'Visual Studio Code',
    },
  },

  users: {
    microsoft: {
      username: 'microsoft',
      type: 'Organization',
      hasPublicRepos: true,
      hasFollowers: true,
      hasFollowing: true,
      hasPublicGists: true,
    },

    facebook: {
      username: 'facebook',
      type: 'Organization',
      hasPublicRepos: true,
      hasFollowers: true,
      hasFollowing: true,
      hasPublicGists: true,
    },
  },

  api: {
    baseUrl: 'https://api.github.com',
    endpoints: {
      repos: '/repos',
      users: '/users',
      search: '/search',
      orgs: '/orgs',
      issues: '/issues',
      pulls: '/pulls',
      releases: '/releases',
      contents: '/contents',
      commits: '/commits',
      tags: '/tags',
      branches: '/branches',
    },
    headers: {
      accept: 'application/vnd.github.v3+json',
      userAgent: 'Playwright-Test-Agent',
    },
    rateLimit: {
      unauthenticated: 60, // requests per hour
      authenticated: 5000, // requests per hour
    },
  },

  expectedResults: {
    search: {
      minStars: 500,
      minForks: 50,
      maxSearchResults: 100,
      perPage: 30,
      timeout: 10000,
    },
    repository: {
      requiredFields: [
        'id',
        'name',
        'full_name',
        'owner',
        'description',
        'stargazers_count',
        'forks_count',
        'language',
        'created_at',
        'updated_at',
      ],
      optionalFields: [
        'homepage',
        'topics',
        'license',
        'default_branch',
        'open_issues_count',
        'watchers_count',
      ],
    },
    user: {
      requiredFields: [
        'id',
        'login',
        'type',
        'public_repos',
        'public_gists',
        'followers',
        'following',
        'created_at',
      ],
      optionalFields: ['name', 'email', 'bio', 'location', 'blog', 'twitter_username', 'company'],
    },
    pagination: {
      maxPages: 10,
      defaultPerPage: 30,
      maxPerPage: 100,
    },
  },

  testCases: {
    searchTypes: ['repositories', 'users', 'issues', 'commits', 'topics', 'wikis', 'discussions'],
    sortOptions: {
      repositories: ['stars', 'forks', 'updated', 'created'],
      users: ['followers', 'repositories', 'joined'],
      issues: ['created', 'updated', 'comments'],
      commits: ['author-date', 'committer-date'],
    },
    orderOptions: ['asc', 'desc'],
    languageFilters: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'Go',
      'Rust',
      'C++',
      'C#',
      'PHP',
      'Ruby',
    ],
  },

  performance: {
    thresholds: {
      pageLoadTime: 5000, // 5 seconds
      apiResponseTime: 3000, // 3 seconds
      searchResponseTime: 2000, // 2 seconds
      repositoryLoadTime: 4000, // 4 seconds
    },
    metrics: [
      'First Contentful Paint',
      'Largest Contentful Paint',
      'Time to Interactive',
      'Total Blocking Time',
    ],
  },

  security: {
    allowedDomains: [
      'github.com',
      '*.github.com',
      'api.github.com',
      'avatars.githubusercontent.com',
      'github.githubassets.com',
      'codeload.github.com',
    ],
    headers: {
      required: [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
      ],
    },
    vulnerabilityTests: {
      xss: [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '"><script>alert("xss")</script>',
      ],
      sqlInjection: ["' OR '1'='1", '; DROP TABLE users; --', 'UNION SELECT * FROM users'],
    },
  },

  accessibility: {
    requiredAriaLabels: ['search', 'navigation', 'main-content', 'repository-list', 'user-profile'],
    keyboardNavigation: {
      shortcuts: [
        { key: 's', description: 'Focus search' },
        { key: 'g c', description: 'Go to Code tab' },
        { key: 'g i', description: 'Go to Issues tab' },
        { key: 'g p', description: 'Go to Pull requests tab' },
        { key: 't', description: 'Activate file finder' },
      ],
    },
    colorContrast: {
      minimumRatio: 4.5,
      largeTextRatio: 3.0,
    },
  },

  localization: {
    supportedLanguages: [
      'en-US',
      'zh-CN',
      'ja-JP',
      'ko-KR',
      'es-ES',
      'fr-FR',
      'de-DE',
      'pt-BR',
      'ru-RU',
    ],
    defaultLanguage: 'en-US',
    regions: ['US', 'CN', 'JP', 'KR', 'ES', 'FR', 'DE', 'BR', 'RU'],
  },

  errorHandling: {
    commonErrors: {
      404: 'Not Found',
      403: 'Forbidden',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    },
    retryConfiguration: {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      exponentialBackoff: true,
    },
  },

  mockData: {
    sampleRepository: {
      id: 123456,
      name: 'sample-repo',
      full_name: 'testuser/sample-repo',
      owner: {
        login: 'testuser',
        id: 12345,
        type: 'User',
      },
      description: 'A sample repository for testing',
      stargazers_count: 100,
      forks_count: 20,
      language: 'JavaScript',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-12-31T23:59:59Z',
    },
    sampleUser: {
      id: 12345,
      login: 'testuser',
      type: 'User',
      name: 'Test User',
      public_repos: 50,
      public_gists: 10,
      followers: 100,
      following: 50,
      created_at: '2020-01-01T00:00:00Z',
    },
  },
};
