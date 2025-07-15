import { test, expect } from '@playwright/test';
import { gitHubTestData } from '@/fixtures/test-data';

test.describe('GitHub API 测试', () => {
  const baseURL = 'https://api.github.com';

  test('应该能够获取仓库信息', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/repos/${testRepo.fullName}`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('name', testRepo.name);
    expect(data).toHaveProperty('owner');
    expect(data.owner).toHaveProperty('login', testRepo.owner);
    expect(data).toHaveProperty('stargazers_count');
    expect(data).toHaveProperty('forks_count');
    expect(data).toHaveProperty('language');
    
    // 验证 Star 数量
    expect(data.stargazers_count).toBeGreaterThan(gitHubTestData.expectedResults.minStars);
    
    // 验证 Fork 数量
    expect(data.forks_count).toBeGreaterThan(gitHubTestData.expectedResults.minForks);
  });

  test('应该能够搜索仓库', async ({ request }) => {
    const query = gitHubTestData.searchQueries.popular;
    
    const response = await request.get(`${baseURL}/search/repositories`, {
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 5,
      },
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('total_count');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
    
    // 验证第一个结果
    const firstRepo = data.items[0];
    expect(firstRepo).toHaveProperty('name');
    expect(firstRepo).toHaveProperty('full_name');
    expect(firstRepo).toHaveProperty('stargazers_count');
    expect(firstRepo).toHaveProperty('language');
    
    // 验证搜索结果与查询相关
    const repoInfo = `${firstRepo.name} ${firstRepo.description || ''}`.toLowerCase();
    expect(repoInfo).toContain(query.toLowerCase());
  });

  test('应该能够获取仓库的编程语言分布', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/repos/${testRepo.fullName}/languages`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // 验证返回的是对象
    expect(typeof data).toBe('object');
    
    // 验证包含期望的编程语言
    const languages = Object.keys(data);
    expect(languages.length).toBeGreaterThan(0);
    
    testRepo.expectedLanguages.forEach(expectedLang => {
      expect(languages).toContain(expectedLang);
    });
    
    // 验证每种语言都有字节数统计
    Object.values(data).forEach(bytes => {
      expect(typeof bytes).toBe('number');
      expect(bytes).toBeGreaterThan(0);
    });
  });

  test('应该能够获取仓库的 README', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/repos/${testRepo.fullName}/readme`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('encoding', 'base64');
    
    // 验证 README 文件名
    expect(data.name.toLowerCase()).toContain('readme');
    
    // 验证内容不为空
    expect(data.content.length).toBeGreaterThan(0);
  });

  test('应该能够获取仓库的提交信息', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/repos/${testRepo.fullName}/commits`, {
      params: {
        per_page: 5,
      },
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    // 验证第一个提交的结构
    const firstCommit = data[0];
    expect(firstCommit).toHaveProperty('sha');
    expect(firstCommit).toHaveProperty('commit');
    expect(firstCommit.commit).toHaveProperty('message');
    expect(firstCommit.commit).toHaveProperty('author');
    expect(firstCommit.commit.author).toHaveProperty('name');
    expect(firstCommit.commit.author).toHaveProperty('date');
  });

  test('应该能够获取仓库的发布版本', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/repos/${testRepo.fullName}/releases`, {
      params: {
        per_page: 3,
      },
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      // 验证发布版本的结构
      const firstRelease = data[0];
      expect(firstRelease).toHaveProperty('tag_name');
      expect(firstRelease).toHaveProperty('name');
      expect(firstRelease).toHaveProperty('published_at');
      expect(firstRelease).toHaveProperty('assets');
      
      // 验证发布时间格式
      expect(new Date(firstRelease.published_at).toString()).not.toBe('Invalid Date');
    }
  });

  test('应该正确处理不存在的仓库', async ({ request }) => {
    const response = await request.get(`${baseURL}/repos/nonexistent/repository`);
    
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Not Found');
  });

  test('应该能够获取用户信息', async ({ request }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    const response = await request.get(`${baseURL}/users/${testRepo.owner}`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('login', testRepo.owner);
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('public_repos');
    expect(data).toHaveProperty('followers');
    expect(data).toHaveProperty('following');
    
    // 验证是组织账户
    expect(['User', 'Organization']).toContain(data.type);
  });
});