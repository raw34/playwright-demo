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

  test('应该能够获取热门视频列表', async ({ request }) => {
    const response = await request.get(`${baseURL}/x/web-interface/popular`, {
      headers: getHeaders(),
      params: {
        ps: 10, // 每页数量
        pn: 1, // 页码
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('code');
    expect(data).toHaveProperty('data');

    // 如果成功，验证数据结构
    if (data.code === 0) {
      expect(data.data).toHaveProperty('list');
      expect(Array.isArray(data.data.list)).toBe(true);
    }
  });

  test('应该能够获取不同分区的内容', async ({ request }) => {
    // 测试动画分区
    const response = await request.get(`${baseURL}/x/web-interface/popular`, {
      headers: getHeaders(),
      params: {
        ps: 5,
        pn: 1,
        rid: 1, // 动画分区
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('code');
    expect(data).toHaveProperty('data');
  });

  test('应该能够处理搜索请求', async ({ request }) => {
    const response = await request.get(`${baseURL}/x/web-interface/search/all/v2`, {
      headers: getHeaders(),
      params: {
        keyword: '测试',
        page: 1,
        platform: 'web',
      },
    });

    // 即使被限制，也应该有响应
    expect([200, 412, 403].includes(response.status())).toBe(true);

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('data');
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
    }
  });

  test('应该能够处理无效的 API 端点', async ({ request }) => {
    const response = await request.get(`${baseURL}/x/web-interface/nonexistent`, {
      headers: getHeaders(),
    });

    // 验证 404 或其他错误状态
    expect([404, 400, 500].includes(response.status())).toBe(true);
  });

  test('应该能够处理 API 超时', async ({ request }) => {
    try {
      const response = await request.get(`${baseURL}/x/web-interface/popular`, {
        headers: getHeaders(),
        params: {
          ps: 10,
          pn: 1,
        },
        timeout: 5000, // 5秒超时
      });

      // 如果没有超时，验证正常响应
      expect(response.status()).toBe(200);
    } catch (error) {
      // 如果超时，验证错误类型
      expect((error as Error).message).toContain('timeout');
    }
  });

  test('应该能够处理缺少参数的请求', async ({ request }) => {
    const response = await request.get(`${baseURL}/x/web-interface/view`, {
      headers: getHeaders(),
      params: {
        // 缺少必需的 bvid 参数
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('code');

    // 缺少必需参数应该返回错误代码
    expect(data.code).not.toBe(0);
  });
});
