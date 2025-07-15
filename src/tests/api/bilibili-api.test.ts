import { test, expect } from '@playwright/test';
import { bilibiliTestData } from '@/fixtures/bilibili.data';

test.describe('Bilibili API 测试', () => {
  const baseURL = 'https://api.bilibili.com';

  // 请求头配置
  const getHeaders = () => {
    return {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Referer: 'https://www.bilibili.com/',
      Origin: 'https://www.bilibili.com',
    };
  };

  test.describe('搜索 API 测试', () => {
    test('应该能够获取搜索结果', async ({ request }) => {
      const searchQuery = bilibiliTestData.searchQueries.popular;

      const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
        headers: getHeaders(),
        params: {
          keyword: searchQuery,
          page: 1,
          platform: 'web',
        },
      });

      // 验证响应状态
      expect(response.status()).toBe(200);

      const data = await response.json();

      // 验证响应结构
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('data');

      // 验证成功响应
      if (data.code === 0) {
        expect(data.data).toHaveProperty('result');

        // 验证搜索结果
        const results = data.data.result;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          // 验证视频结果结构
          const videoResults = results.find((item: any) => item.result_type === 'video');
          if (videoResults && videoResults.data) {
            expect(Array.isArray(videoResults.data)).toBe(true);

            if (videoResults.data.length > 0) {
              const firstVideo = videoResults.data[0];
              expect(firstVideo).toHaveProperty('title');
              expect(firstVideo).toHaveProperty('author');
              expect(firstVideo).toHaveProperty('play');
              expect(firstVideo).toHaveProperty('duration');
            }
          }
        }
      }
    });

    test('应该能够处理不同的搜索查询', async ({ request }) => {
      const searchQueries = [
        bilibiliTestData.searchQueries.technology,
        bilibiliTestData.searchQueries.entertainment,
        bilibiliTestData.searchQueries.music,
      ];

      for (const query of searchQueries) {
        const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
          headers: getHeaders(),
          params: {
            keyword: query,
            page: 1,
            platform: 'web',
          },
        });

        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log(`搜索 "${query}" 的响应代码:`, data.code);

        // 验证响应格式
        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('data');
      }
    });

    test('应该能够处理空搜索查询', async ({ request }) => {
      const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
        headers: getHeaders(),
        params: {
          keyword: '',
          page: 1,
          platform: 'web',
        },
      });

      // 验证响应状态
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');

      // 空搜索可能返回错误代码或空结果
      if (data.code !== 0) {
        console.log('空搜索查询的响应:', data.message || data.code);
      }
    });

    test('应该能够处理分页搜索', async ({ request }) => {
      const searchQuery = bilibiliTestData.searchQueries.popular;

      // 测试前两页
      for (let page = 1; page <= 2; page++) {
        const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
          headers: getHeaders(),
          params: {
            keyword: searchQuery,
            page: page,
            platform: 'web',
          },
        });

        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log(`第 ${page} 页搜索结果响应代码:`, data.code);

        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('data');
      }
    });
  });

  test.describe('视频信息 API 测试', () => {
    test.skip('应该能够获取视频详情', async ({ request }) => {
      // 这个测试被跳过，因为需要真实的视频 ID
      // 在实际使用中，你需要替换为真实的视频 ID

      const videoId = 'BV1234567890'; // 示例视频 ID

      const response = await request.get(`${baseURL}/x/web-interface/view`, {
        headers: getHeaders(),
        params: {
          bvid: videoId,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('data');

      if (data.code === 0) {
        const videoData = data.data;
        expect(videoData).toHaveProperty('title');
        expect(videoData).toHaveProperty('owner');
        expect(videoData).toHaveProperty('stat');
        expect(videoData).toHaveProperty('duration');
      }
    });

    test('应该能够处理无效的视频 ID', async ({ request }) => {
      const invalidVideoIds = bilibiliTestData.videoData.invalidVideoIds;

      for (const invalidId of invalidVideoIds) {
        const response = await request.get(`${baseURL}/x/web-interface/view`, {
          headers: getHeaders(),
          params: {
            bvid: invalidId,
          },
        });

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('code');

        // 无效视频 ID 应该返回错误代码
        expect(data.code).not.toBe(0);
        console.log(`无效视频 ID ${invalidId} 的响应:`, data.code, data.message);
      }
    });
  });

  test.describe('用户信息 API 测试', () => {
    test.skip('应该能够获取用户信息', async ({ request }) => {
      // 这个测试被跳过，因为需要真实的用户 ID
      // 在实际使用中，你需要替换为真实的用户 ID

      const userId = 123456; // 示例用户 ID

      const response = await request.get(`${baseURL}/x/web-interface/card`, {
        headers: getHeaders(),
        params: {
          mid: userId,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('data');

      if (data.code === 0) {
        const userData = data.data;
        expect(userData).toHaveProperty('card');
        expect(userData.card).toHaveProperty('name');
        expect(userData.card).toHaveProperty('level_info');
        expect(userData.card).toHaveProperty('follower');
      }
    });
  });

  test.describe('热门内容 API 测试', () => {
    test('应该能够获取热门视频', async ({ request }) => {
      const response = await request.get(`${baseURL}/x/web-interface/popular`, {
        headers: getHeaders(),
        params: {
          ps: 20, // 每页数量
          pn: 1, // 页码
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('data');

      if (data.code === 0) {
        const popularData = data.data;
        expect(popularData).toHaveProperty('list');
        expect(Array.isArray(popularData.list)).toBe(true);

        if (popularData.list.length > 0) {
          const firstVideo = popularData.list[0];
          expect(firstVideo).toHaveProperty('title');
          expect(firstVideo).toHaveProperty('owner');
          expect(firstVideo).toHaveProperty('stat');
          expect(firstVideo).toHaveProperty('duration');
        }
      }
    });

    test('应该能够获取不同分区的热门内容', async ({ request }) => {
      // 测试不同分区的热门内容
      const regions = [1, 3, 4, 5, 129]; // 不同分区 ID

      for (const region of regions) {
        const response = await request.get(`${baseURL}/x/web-interface/popular`, {
          headers: getHeaders(),
          params: {
            ps: 10,
            pn: 1,
            rid: region,
          },
        });

        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log(`分区 ${region} 的热门内容响应代码:`, data.code);

        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('data');
      }
    });
  });

  test.describe('API 性能测试', () => {
    test('搜索 API 响应时间应该在合理范围内', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
        headers: getHeaders(),
        params: {
          keyword: bilibiliTestData.searchQueries.popular,
          page: 1,
          platform: 'web',
        },
      });

      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(bilibiliTestData.performance.thresholds.searchResponseTime);

      console.log(`搜索 API 响应时间: ${responseTime}ms`);
    });

    test('热门内容 API 响应时间应该在合理范围内', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${baseURL}/x/web-interface/popular`, {
        headers: getHeaders(),
        params: {
          ps: 20,
          pn: 1,
        },
      });

      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(bilibiliTestData.performance.thresholds.searchResponseTime);

      console.log(`热门内容 API 响应时间: ${responseTime}ms`);
    });
  });

  test.describe('API 错误处理测试', () => {
    test('应该能够处理网络超时', async ({ request }) => {
      // 设置较短的超时时间来测试超时处理
      const response = await request
        .get(`${baseURL}/x/web-interface/search/all/v2`, {
          headers: getHeaders(),
          params: {
            keyword: bilibiliTestData.searchQueries.popular,
            page: 1,
            platform: 'web',
          },
          timeout: 1, // 1ms 超时，强制超时
        })
        .catch(error => {
          // 验证超时错误
          expect(error.message).toContain('timeout');
          return { status: () => 0 }; // 模拟响应对象
        });

      // 如果没有超时，验证正常响应
      if (response.status() === 200) {
        console.log('API 响应正常，未发生超时');
      }
    });

    test('应该能够处理无效的 API 端点', async ({ request }) => {
      const response = await request.get(`${baseURL}/x/web-interface/nonexistent`, {
        headers: getHeaders(),
      });

      // 验证 404 或其他错误状态
      expect([404, 400, 500].includes(response.status())).toBe(true);
    });

    test('应该能够处理缺少必需参数的请求', async ({ request }) => {
      const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
        headers: getHeaders(),
        params: {
          // 缺少 keyword 参数
          page: 1,
          platform: 'web',
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');

      // 缺少必需参数应该返回错误代码
      expect(data.code).not.toBe(0);
      console.log('缺少参数的响应:', data.code, data.message);
    });
  });

  test.describe('API 安全测试', () => {
    test('应该能够处理 SQL 注入尝试', async ({ request }) => {
      const maliciousQueries = [
        "' OR '1'='1",
        '; DROP TABLE users; --',
        'UNION SELECT * FROM users',
        '<script>alert("xss")</script>',
      ];

      for (const maliciousQuery of maliciousQueries) {
        const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
          headers: getHeaders(),
          params: {
            keyword: maliciousQuery,
            page: 1,
            platform: 'web',
          },
        });

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('code');

        // 记录恶意查询的响应，用于安全分析
        console.log(`恶意查询 "${maliciousQuery}" 的响应:`, data.code);
      }
    });

    test('应该能够处理过长的参数值', async ({ request }) => {
      const longString = 'a'.repeat(1000);

      const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
        headers: getHeaders(),
        params: {
          keyword: longString,
          page: 1,
          platform: 'web',
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('code');

      console.log('过长参数的响应:', data.code);
    });
  });
});
