/**
 * 测试数据统一导出文件
 */

// 导出各个网站的测试数据
export { gitHubTestData } from './github.data';
export { bilibiliTestData } from './bilibili.data';
export { demoTestData } from './demo.data';

// 导入测试数据用于选择器
import { gitHubTestData } from './github.data';
import { bilibiliTestData } from './bilibili.data';
import { demoTestData } from './demo.data';

// 常用的测试数据选择器
export const TestDataSelectors = {
  github: {
    searchQuery: gitHubTestData.searchQueries.popular,
    repository: gitHubTestData.repositories.playwright,
    user: gitHubTestData.users.microsoft,
  },

  bilibili: {
    searchQuery: bilibiliTestData.searchQueries.popular,
    category: bilibiliTestData.navigation.mainCategories[0],
    video: bilibiliTestData.videoData.sampleVideos[0],
  },

  demo: {
    loginCredentials: demoTestData.loginCredentials.valid,
    testUrl: demoTestData.testUrls.example,
    formData: demoTestData.formData.textInputs.normal,
  },
};

// 默认导出
export default {
  TestDataSelectors,
  gitHubTestData,
  bilibiliTestData,
  demoTestData,
};
