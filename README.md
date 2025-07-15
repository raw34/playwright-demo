# Playwright Demo

A comprehensive Playwright E2E testing framework built with TypeScript, featuring best practices for test automation.

## Features

- 🎭 **Playwright** - Modern browser automation
- 🔷 **TypeScript** - Type-safe test development  
- 📁 **Page Object Model** - Maintainable test architecture
- 🧪 **Multiple Test Types** - E2E, API, and component tests
- 🔧 **Code Quality** - ESLint + Prettier configuration
- 🚀 **CI/CD Ready** - GitHub Actions workflow
- 📊 **Rich Reporting** - HTML reports with screenshots/videos

## Project Structure

```
playwright-demo/
├── src/
│   ├── pages/              # Page Object Model classes
│   │   ├── base.page.ts    # Base page with common methods
│   │   ├── login.page.ts   # Login page object
│   │   └── home.page.ts    # Home page object
│   ├── tests/              # Test files
│   │   ├── e2e/           # End-to-end tests
│   │   └── api/           # API tests
│   ├── fixtures/          # Test data and fixtures
│   ├── utils/             # Helper utilities
│   └── config/            # Setup and teardown
├── .github/workflows/     # CI/CD configuration
├── playwright.config.ts   # Playwright configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Quick Start

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Install browsers**:
   ```bash
   yarn install:browsers
   ```

3. **Run tests**:
   ```bash
   yarn test
   ```

## Available Scripts

- `yarn test` - Run all tests
- `yarn test:headed` - Run tests in headed mode
- `yarn test:debug` - Run tests in debug mode
- `yarn test:ui` - Run tests with Playwright UI
- `yarn test:report` - Show test report
- `yarn test:codegen` - Generate tests with codegen
- `yarn lint` - Check code quality
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Check TypeScript types

## Configuration

### Environment Variables

- `BASE_URL` - Base URL for tests (default: http://localhost:3000)
- `API_BASE_URL` - API base URL for API tests

### Test Data

Test data is managed in `src/fixtures/test-data.ts` with predefined users and URLs.

## Best Practices

- Use Page Object Model for maintainable tests
- Leverage TypeScript for type safety
- Include both positive and negative test cases
- Use meaningful test descriptions
- Add proper error handling and assertions
- Follow the established code style guidelines

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Run linting and type checking before committing
4. Use conventional commit messages

## License

MIT