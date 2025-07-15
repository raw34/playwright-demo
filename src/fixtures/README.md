# 测试数据文件说明

测试数据按网站分类，提供更好的组织和维护性。

## 📁 文件结构

```
src/fixtures/
├── README.md           # 本文件
├── index.ts            # 统一导出
├── test-data.ts        # 主文件（向后兼容）
├── github.data.ts      # GitHub 测试数据
├── bilibili.data.ts    # Bilibili 测试数据
└── demo.data.ts        # 通用测试数据
```

## 🚀 使用方式

### 推荐方式：直接导入

```typescript
// 直接导入特定网站的数据
import { gitHubTestData } from '@/fixtures/github.data';
import { bilibiliTestData } from '@/fixtures/bilibili.data';
import { demoTestData } from '@/fixtures/demo.data';

// 使用统一导出
import { gitHubTestData, bilibiliTestData, TestDataSelectors } from '@/fixtures';

// 使用快捷选择器
const githubRepo = TestDataSelectors.github.repository;
const bilibiliQuery = TestDataSelectors.bilibili.searchQuery;
```

### 向后兼容方式

```typescript
// 原有的导入方式仍然有效
import { gitHubTestData, bilibiliTestData, demoTestData } from '@/fixtures/test-data';
```

## 📊 数据内容

### GitHub 数据

- 搜索查询、仓库信息、用户数据
- API 配置、性能阈值、安全配置
- 辅助功能、本地化设置

### Bilibili 数据

- 搜索查询、视频数据、用户配置
- 导航分类、API 配置、性能阈值
- 安全配置、本地化设置

### Demo 数据

- 登录凭据、表单数据、文件上传
- UI 组件、交互操作、性能测试
- 浏览器兼容性、响应式设计

## 💡 最佳实践

1. **按需导入**：只导入需要的数据
2. **类型安全**：使用 TypeScript 类型检查
3. **避免硬编码**：使用测试数据常量
4. **定期更新**：保持数据与实际网站同步

---

_简洁的结构更易于维护和使用_
