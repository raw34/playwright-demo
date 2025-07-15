/**
 * Bilibili 测试数据
 * 包含 Bilibili 网站和 API 测试相关的数据配置
 */

export const bilibiliTestData = {
  baseUrl: 'https://www.bilibili.com',

  searchQueries: {
    popular: '编程',
    technology: 'JavaScript',
    entertainment: '搞笑',
    music: '音乐',
    gaming: '游戏',
    anime: '动画',
    movie: '电影',
    food: '美食',
    dance: '舞蹈',
    sports: '体育',
    empty: '',
    specialChars: '!@#$%^&*()',
    longQuery: 'a'.repeat(100),
    unicode: '测试中文搜索🎵',
    number: '123456',
  },

  expectedResults: {
    searchResults: {
      minResults: 1,
      maxResultsPerPage: 20,
      timeout: 10000,
      defaultPage: 1,
      maxPages: 50,
    },
    videoCard: {
      requiredElements: ['title', 'author', 'duration', 'playCount'],
      maxTitleLength: 100,
      minTitleLength: 1,
      maxAuthorLength: 50,
      minDuration: 1, // 秒
      maxDuration: 7200, // 2小时
    },
    pageLoad: {
      timeout: 15000,
      networkIdleTimeout: 2000,
      domContentLoadedTimeout: 10000,
    },
  },

  navigation: {
    mainCategories: [
      '首页',
      '动画',
      '番剧',
      '国创',
      '音乐',
      '舞蹈',
      '游戏',
      '知识',
      '科技',
      '运动',
      '汽车',
      '生活',
      '美食',
      '动物圈',
      '鬼畜',
      '时尚',
      '娱乐',
      '影视',
    ],
    subCategories: {
      技术: ['编程', '前端', '后端', '算法', '数据结构', '人工智能', '机器学习'],
      娱乐: ['搞笑', '综艺', '明星', '网红', '段子', '恶搞'],
      游戏: ['手游', '端游', '主机游戏', '游戏攻略', '电竞', '游戏解说'],
      音乐: ['流行', '摇滚', '古典', '民谣', '电子', '翻唱', '原创'],
      动画: ['国产动画', '日本动画', '欧美动画', '短片', 'MAD', 'MMD'],
      生活: ['日常', 'Vlog', '美食', '旅行', '摄影', '手工', '宠物'],
    },
    trending: {
      全站: 'popular',
      动画: 'anime',
      音乐: 'music',
      游戏: 'game',
      科技: 'tech',
      生活: 'life',
      娱乐: 'entertainment',
    },
  },

  videoData: {
    sampleVideos: [
      {
        title: '【编程教程】JavaScript入门到精通',
        author: '技术UP主',
        category: '科技',
        tags: ['编程', 'JavaScript', '教程', '前端'],
        minDuration: 600, // 10分钟
        maxDuration: 3600, // 1小时
        minPlayCount: 1000,
        minLikeCount: 100,
        minCoinCount: 50,
        minFavoriteCount: 200,
        hasSubtitles: true,
        hasComments: true,
        quality: ['720P', '1080P', '1080P60'],
      },
      {
        title: '搞笑视频合集第一期',
        author: '娱乐UP主',
        category: '娱乐',
        tags: ['搞笑', '合集', '娱乐', '日常'],
        minDuration: 300, // 5分钟
        maxDuration: 1800, // 30分钟
        minPlayCount: 5000,
        minLikeCount: 500,
        minCoinCount: 200,
        minFavoriteCount: 1000,
        hasSubtitles: false,
        hasComments: true,
        quality: ['720P', '1080P'],
      },
      {
        title: '【音乐】纯音乐放松时光',
        author: '音乐UP主',
        category: '音乐',
        tags: ['音乐', '纯音乐', '放松', '治愈'],
        minDuration: 1800, // 30分钟
        maxDuration: 7200, // 2小时
        minPlayCount: 2000,
        minLikeCount: 300,
        minCoinCount: 100,
        minFavoriteCount: 500,
        hasSubtitles: false,
        hasComments: true,
        quality: ['720P', '1080P'],
      },
    ],
    invalidVideoIds: [
      'BV1invalid123',
      'av0000000',
      'nonexistent',
      'BV1234567890123456789', // 过长的ID
      'av-123', // 负数ID
      'BV1@#$%^&*()', // 特殊字符
    ],
    videoTypes: [
      'UGC', // 用户生成内容
      'PGC', // 专业生成内容
      'OGV', // 原创视频
      'Live', // 直播
      'Interactive', // 互动视频
    ],
  },

  userProfiles: {
    testUser: {
      // 注意：这里不应该包含真实的用户名和密码
      // 仅用于测试数据结构示例
      username: 'test_user_bilibili',
      nickname: '测试用户',
      level: 1,
      exp: 100,
      followers: 0,
      following: 0,
      coins: 0,
      videos: 0,
      avatar: 'default_avatar.png',
      sign: '这是一个测试用户',
      joinDate: '2023-01-01',
      vipStatus: 'normal',
      medalList: [],
    },
    sampleCreator: {
      username: 'sample_creator',
      nickname: '示例创作者',
      level: 5,
      exp: 50000,
      followers: 10000,
      following: 100,
      coins: 1000,
      videos: 50,
      avatar: 'creator_avatar.png',
      sign: '专业的视频创作者',
      joinDate: '2020-01-01',
      vipStatus: 'vip',
      medalList: ['创作新星', '百万播放'],
    },
  },

  api: {
    baseUrl: 'https://api.bilibili.com',
    endpoints: {
      search: '/x/web-interface/search/all/v2',
      searchSuggest: '/x/web-interface/search/suggest',
      videoInfo: '/x/web-interface/view',
      videoPages: '/x/player/pagelist',
      videoTags: '/x/tag/info',
      userInfo: '/x/web-interface/card',
      userVideos: '/x/space/arc/search',
      trending: '/x/web-interface/popular',
      ranking: '/x/web-interface/ranking',
      categories: '/x/web-interface/online',
      comments: '/x/v2/reply',
      favorites: '/x/v3/fav/folder/created/list-all',
      history: '/x/web-interface/history/cursor',
      recommend: '/x/web-interface/index/top/rcmd',
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.bilibili.com/',
      Origin: 'https://www.bilibili.com',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMinute: 300,
      burstLimit: 50,
      cooldownTime: 1000, // 毫秒
    },
    responseFormat: {
      successCode: 0,
      errorCodes: {
        '-400': '请求错误',
        '-401': '未认证',
        '-403': '访问权限不足',
        '-404': '资源不存在',
        '-412': '请求被拦截',
        '-500': '服务器内部错误',
        '-509': '请求过于频繁',
      },
    },
  },

  accessibility: {
    requiredAriaLabels: [
      'search',
      'navigation',
      'video-player',
      'user-menu',
      'video-list',
      'comment-section',
      'playlist',
    ],
    keyboardNavigation: {
      searchShortcut: 'Ctrl+K',
      playerShortcuts: [
        { key: 'Space', action: 'play/pause' },
        { key: 'ArrowLeft', action: 'seek backward' },
        { key: 'ArrowRight', action: 'seek forward' },
        { key: 'ArrowUp', action: 'volume up' },
        { key: 'ArrowDown', action: 'volume down' },
        { key: 'F', action: 'fullscreen' },
        { key: 'M', action: 'mute' },
        { key: 'C', action: 'subtitle' },
        { key: 'Shift+>', action: 'speed up' },
        { key: 'Shift+<', action: 'speed down' },
      ],
    },
    colorContrast: {
      minimumRatio: 4.5,
      largeTextRatio: 3.0,
      backgroundColors: ['#ffffff', '#f4f4f4', '#e7e7e7'],
      textColors: ['#212121', '#757575', '#9e9e9e'],
    },
  },

  performance: {
    thresholds: {
      pageLoadTime: 3000, // 3秒
      searchResponseTime: 2000, // 2秒
      videoPlayerLoadTime: 5000, // 5秒
      imageLoadTime: 1000, // 1秒
      apiResponseTime: 1500, // 1.5秒
      thumbnailLoadTime: 800, // 0.8秒
    },
    metrics: [
      'First Contentful Paint',
      'Largest Contentful Paint',
      'Cumulative Layout Shift',
      'Time to Interactive',
      'Total Blocking Time',
      'Speed Index',
    ],
    budgets: {
      javascript: 500, // KB
      css: 100, // KB
      images: 1000, // KB
      fonts: 200, // KB
      total: 2000, // KB
    },
  },

  security: {
    csp: {
      allowedDomains: [
        'bilibili.com',
        '*.bilibili.com',
        'bilivideo.com',
        '*.bilivideo.com',
        'hdslb.com',
        '*.hdslb.com',
        'biliapi.com',
        '*.biliapi.com',
      ],
      allowedProtocols: ['https:', 'wss:'],
    },
    headers: {
      required: [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Request-ID',
      ],
      optional: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    },
    vulnerabilityTests: {
      xss: [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '"><script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
      ],
      sqlInjection: [
        "' OR '1'='1",
        '; DROP TABLE users; --',
        'UNION SELECT * FROM users',
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ],
      csrf: ['csrf_token_test', 'missing_csrf_token', 'invalid_csrf_token'],
    },
  },

  localization: {
    supportedLanguages: ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'],
    defaultLanguage: 'zh-CN',
    regions: ['CN', 'TW', 'HK', 'US', 'JP'],
    timezones: ['Asia/Shanghai', 'Asia/Taipei', 'Asia/Hong_Kong', 'America/New_York', 'Asia/Tokyo'],
    currencies: ['CNY', 'USD', 'JPY', 'HKD', 'TWD'],
  },

  errorHandling: {
    networkErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_REFUSED',
      'DNS_ERROR',
      'SSL_ERROR',
    ],
    retryConfiguration: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      retryConditions: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR_5XX'],
    },
    fallbackBehavior: {
      searchFallback: 'show_cached_results',
      videoFallback: 'show_placeholder',
      commentFallback: 'show_loading_message',
    },
  },

  testing: {
    environments: {
      development: {
        baseUrl: 'https://dev.bilibili.com',
        apiUrl: 'https://api-dev.bilibili.com',
        debug: true,
        timeout: 30000,
      },
      staging: {
        baseUrl: 'https://staging.bilibili.com',
        apiUrl: 'https://api-staging.bilibili.com',
        debug: false,
        timeout: 15000,
      },
      production: {
        baseUrl: 'https://www.bilibili.com',
        apiUrl: 'https://api.bilibili.com',
        debug: false,
        timeout: 10000,
      },
    },
    browserSupport: {
      desktop: ['Chrome >= 80', 'Firefox >= 78', 'Safari >= 13', 'Edge >= 80'],
      mobile: ['Chrome Mobile >= 80', 'Safari Mobile >= 13', 'Samsung Internet >= 12'],
    },
    deviceTypes: ['desktop', 'tablet', 'mobile', 'smart-tv', 'gaming-console'],
  },

  mockData: {
    sampleSearchResult: {
      code: 0,
      message: 'success',
      data: {
        result: [
          {
            result_type: 'video',
            data: [
              {
                title: '测试视频标题',
                author: '测试作者',
                play: 1000,
                video_review: 50,
                duration: '10:30',
                pic: 'https://example.com/thumbnail.jpg',
                description: '这是一个测试视频',
                tag: '测试,视频,样本',
                bvid: 'BV1234567890',
                aid: 12345,
              },
            ],
          },
        ],
      },
    },
    sampleVideoInfo: {
      code: 0,
      message: 'success',
      data: {
        bvid: 'BV1234567890',
        aid: 12345,
        title: '测试视频标题',
        desc: '这是一个测试视频的描述',
        owner: {
          mid: 54321,
          name: '测试UP主',
          face: 'https://example.com/avatar.jpg',
        },
        stat: {
          view: 10000,
          danmaku: 100,
          reply: 50,
          favorite: 200,
          coin: 150,
          share: 30,
          like: 500,
        },
        duration: 630,
        pubdate: 1640995200,
        ctime: 1640995200,
        pages: [
          {
            cid: 98765,
            page: 1,
            from: 'vupload',
            part: 'P1',
            duration: 630,
            vid: '',
            weblink: '',
            dimension: {
              width: 1920,
              height: 1080,
              rotate: 0,
            },
          },
        ],
      },
    },
  },
};
