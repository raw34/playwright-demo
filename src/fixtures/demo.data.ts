/**
 * 通用和演示网站测试数据
 * 包含基础测试数据和演示网站相关的配置
 */

export const demoTestData = {
  // 登录测试数据
  loginCredentials: {
    valid: {
      username: 'tomsmith',
      password: 'SuperSecretPassword!',
      expectedMessage: 'You logged into a secure area!',
      successUrl: '/secure',
    },
    invalid: {
      username: 'invalid',
      password: 'wrongpassword',
      expectedMessage: 'Your username is invalid!',
      errorSelector: '.flash.error',
    },
    empty: {
      username: '',
      password: '',
      expectedMessage: 'Username is required',
    },
    specialChars: {
      username: 'test@user.com',
      password: 'P@ssw0rd!123',
      expectedMessage: 'Invalid credentials',
    },
  },

  // 测试网站URL
  testUrls: {
    example: 'https://example.com',
    loginDemo: 'https://the-internet.herokuapp.com/login',
    logoutDemo: 'https://the-internet.herokuapp.com/logout',
    httpbin: 'https://httpbin.org',
    github: 'https://github.com',
    bilibili: 'https://www.bilibili.com',

    // 更多演示网站
    fileUpload: 'https://the-internet.herokuapp.com/upload',
    dropdown: 'https://the-internet.herokuapp.com/dropdown',
    checkboxes: 'https://the-internet.herokuapp.com/checkboxes',
    radioButtons: 'https://the-internet.herokuapp.com/radio_buttons',
    tables: 'https://the-internet.herokuapp.com/tables',
    forms: 'https://the-internet.herokuapp.com/form_authentication',
    alerts: 'https://the-internet.herokuapp.com/javascript_alerts',
    frames: 'https://the-internet.herokuapp.com/frames',
    windows: 'https://the-internet.herokuapp.com/windows',
    dragDrop: 'https://the-internet.herokuapp.com/drag_and_drop',
    slider: 'https://the-internet.herokuapp.com/horizontal_slider',
    tooltip: 'https://the-internet.herokuapp.com/hovers',
    contextMenu: 'https://the-internet.herokuapp.com/context_menu',
    keyPress: 'https://the-internet.herokuapp.com/key_presses',
    notification: 'https://the-internet.herokuapp.com/notification_messages',
    status: 'https://the-internet.herokuapp.com/status_codes',
    redirect: 'https://the-internet.herokuapp.com/redirector',
    disappearing: 'https://the-internet.herokuapp.com/disappearing_elements',
    loading: 'https://the-internet.herokuapp.com/dynamic_loading',
    entry: 'https://the-internet.herokuapp.com/entry_ad',
    exit: 'https://the-internet.herokuapp.com/exit_intent',
    floating: 'https://the-internet.herokuapp.com/floating_menu',
    forgot: 'https://the-internet.herokuapp.com/forgot_password',
    geolocation: 'https://the-internet.herokuapp.com/geolocation',
    infiniteScroll: 'https://the-internet.herokuapp.com/infinite_scroll',
    inputs: 'https://the-internet.herokuapp.com/inputs',
    jqueryMenu: 'https://the-internet.herokuapp.com/jqueryui/menu',
    multipleWindows: 'https://the-internet.herokuapp.com/windows',
    nestedFrames: 'https://the-internet.herokuapp.com/nested_frames',
    shadowDom: 'https://the-internet.herokuapp.com/shadowdom',
    sortable: 'https://the-internet.herokuapp.com/tables',
    wysiwyg: 'https://the-internet.herokuapp.com/tinymce',
  },

  // 表单测试数据
  formData: {
    textInputs: {
      normal: 'Test input value',
      empty: '',
      numeric: '123456',
      special: '!@#$%^&*()',
      unicode: '测试中文输入 🎉',
      long: 'a'.repeat(1000),
      sql: "'; DROP TABLE users; --",
      xss: '<script>alert("xss")</script>',
    },
    email: {
      valid: ['test@example.com', 'user.name@domain.co.uk', 'firstname+lastname@example.com'],
      invalid: ['invalid-email', '@example.com', 'test@', 'test@.com', 'test.example.com'],
    },
    password: {
      weak: ['123', 'password', 'abc'],
      medium: ['Password123', 'Test1234', 'MyPass1!'],
      strong: ['P@ssw0rd!123', 'MyStr0ng!P@ss', 'Secur3$Pass'],
    },
    phone: {
      valid: ['+1-555-123-4567', '(555) 123-4567', '555.123.4567', '+86-138-0013-8000'],
      invalid: ['123', 'abc-def-ghij', '555-123-456', '+1-555-123-45678'],
    },
    url: {
      valid: [
        'https://example.com',
        'http://test.domain.co.uk',
        'https://sub.domain.com/path?query=value',
      ],
      invalid: ['not-a-url', 'ftp://example.com', 'https://', 'https://.'],
    },
  },

  // 文件上传测试数据
  fileUpload: {
    supportedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/pdf',
      'application/zip',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    testFiles: {
      image: 'test-image.jpg',
      text: 'test-file.txt',
      pdf: 'test-document.pdf',
      large: 'large-file.zip',
      invalid: 'invalid-file.exe',
    },
  },

  // 下拉菜单测试数据
  dropdown: {
    options: [
      { value: '', text: 'Please select an option' },
      { value: '1', text: 'Option 1' },
      { value: '2', text: 'Option 2' },
      { value: '3', text: 'Option 3' },
    ],
    multiSelect: [
      { value: 'option1', text: 'First Option' },
      { value: 'option2', text: 'Second Option' },
      { value: 'option3', text: 'Third Option' },
      { value: 'option4', text: 'Fourth Option' },
    ],
  },

  // 表格测试数据
  tableData: {
    headers: ['Name', 'Age', 'Email', 'Department'],
    rows: [
      ['John Doe', '30', 'john@example.com', 'Engineering'],
      ['Jane Smith', '25', 'jane@example.com', 'Marketing'],
      ['Bob Johnson', '35', 'bob@example.com', 'Sales'],
      ['Alice Brown', '28', 'alice@example.com', 'HR'],
    ],
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 10,
  },

  // 弹窗和提示测试数据
  alerts: {
    simple: {
      text: 'This is a simple alert',
      type: 'alert',
      buttons: ['OK'],
    },
    confirm: {
      text: 'Are you sure you want to continue?',
      type: 'confirm',
      buttons: ['OK', 'Cancel'],
    },
    prompt: {
      text: 'Please enter your name:',
      type: 'prompt',
      buttons: ['OK', 'Cancel'],
      defaultValue: 'John Doe',
    },
  },

  // 拖拽测试数据
  dragDrop: {
    elements: [
      { id: 'draggable1', text: 'Draggable Item 1' },
      { id: 'draggable2', text: 'Draggable Item 2' },
      { id: 'draggable3', text: 'Draggable Item 3' },
    ],
    dropZones: [
      { id: 'dropzone1', text: 'Drop Zone 1' },
      { id: 'dropzone2', text: 'Drop Zone 2' },
    ],
  },

  // 滑块测试数据
  slider: {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    testValues: [0, 25, 50, 75, 100],
  },

  // 键盘操作测试数据
  keyboard: {
    keys: [
      'Enter',
      'Escape',
      'Tab',
      'Space',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Delete',
      'Backspace',
    ],
    shortcuts: [
      { keys: 'Ctrl+A', action: 'Select All' },
      { keys: 'Ctrl+C', action: 'Copy' },
      { keys: 'Ctrl+V', action: 'Paste' },
      { keys: 'Ctrl+Z', action: 'Undo' },
      { keys: 'Ctrl+Y', action: 'Redo' },
      { keys: 'Ctrl+S', action: 'Save' },
      { keys: 'Ctrl+O', action: 'Open' },
      { keys: 'Ctrl+N', action: 'New' },
      { keys: 'Ctrl+P', action: 'Print' },
      { keys: 'Ctrl+F', action: 'Find' },
    ],
  },

  // 鼠标操作测试数据
  mouse: {
    actions: ['click', 'double_click', 'right_click', 'hover', 'drag', 'drop', 'scroll'],
    positions: [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 300 },
    ],
  },

  // 性能测试数据
  performance: {
    thresholds: {
      pageLoadTime: 3000,
      domContentLoaded: 2000,
      firstPaint: 1000,
      firstContentfulPaint: 1500,
      largestContentfulPaint: 2500,
      timeToInteractive: 3000,
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100,
    },
    metrics: [
      'loadEventEnd',
      'domContentLoadedEventEnd',
      'responseStart',
      'domInteractive',
      'domComplete',
    ],
  },

  // 辅助功能测试数据
  accessibility: {
    requiredAriaLabels: [
      'navigation',
      'main',
      'search',
      'form',
      'button',
      'link',
      'heading',
      'list',
      'table',
      'dialog',
    ],
    colorContrast: {
      minimumRatio: 4.5,
      largeTextRatio: 3.0,
      nonTextRatio: 3.0,
    },
    keyboardNavigation: {
      tabOrder: true,
      focusIndicator: true,
      skipLinks: true,
      accessKeys: true,
    },
    screenReader: {
      altText: true,
      headingStructure: true,
      labelAssociation: true,
      errorMessages: true,
    },
  },

  // 浏览器兼容性测试数据
  browserCompatibility: {
    desktop: [
      { name: 'Chrome', version: '≥90' },
      { name: 'Firefox', version: '≥88' },
      { name: 'Safari', version: '≥14' },
      { name: 'Edge', version: '≥90' },
    ],
    mobile: [
      { name: 'Chrome Mobile', version: '≥90' },
      { name: 'Safari Mobile', version: '≥14' },
      { name: 'Firefox Mobile', version: '≥88' },
      { name: 'Samsung Internet', version: '≥14' },
    ],
    features: [
      'flexbox',
      'grid',
      'css-variables',
      'es6-modules',
      'async-await',
      'fetch',
      'websockets',
      'webgl',
      'geolocation',
      'notifications',
    ],
  },

  // 响应式设计测试数据
  responsive: {
    breakpoints: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
      largeDesktop: { width: 2560, height: 1440 },
    },
    orientations: ['portrait', 'landscape'],
    devicePixelRatios: [1, 2, 3],
  },

  // 网络测试数据
  network: {
    conditions: [
      { name: 'Fast 3G', downloadThroughput: 1500000, uploadThroughput: 750000, latency: 40 },
      { name: 'Slow 3G', downloadThroughput: 500000, uploadThroughput: 500000, latency: 400 },
      { name: 'Offline', downloadThroughput: 0, uploadThroughput: 0, latency: 0 },
    ],
    statusCodes: [
      { code: 200, message: 'OK' },
      { code: 301, message: 'Moved Permanently' },
      { code: 302, message: 'Found' },
      { code: 400, message: 'Bad Request' },
      { code: 401, message: 'Unauthorized' },
      { code: 403, message: 'Forbidden' },
      { code: 404, message: 'Not Found' },
      { code: 500, message: 'Internal Server Error' },
      { code: 502, message: 'Bad Gateway' },
      { code: 503, message: 'Service Unavailable' },
    ],
  },

  // 安全测试数据
  security: {
    headers: [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy',
      'Permissions-Policy',
    ],
    vulnerabilities: {
      xss: [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
      ],
      sqlInjection: ["' OR '1'='1", '; DROP TABLE users; --', "' UNION SELECT * FROM users --"],
      csrf: ['missing_csrf_token', 'invalid_csrf_token', 'expired_csrf_token'],
    },
  },

  // 测试环境配置
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:3001',
      debug: true,
      timeout: 30000,
    },
    staging: {
      baseUrl: 'https://staging.example.com',
      apiUrl: 'https://api-staging.example.com',
      debug: false,
      timeout: 15000,
    },
    production: {
      baseUrl: 'https://example.com',
      apiUrl: 'https://api.example.com',
      debug: false,
      timeout: 10000,
    },
  },

  // 错误处理测试数据
  errorHandling: {
    retryConfiguration: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      retryConditions: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR_5XX'],
    },
    fallbackBehavior: {
      showErrorMessage: true,
      logError: true,
      redirectToErrorPage: false,
      retryAutomatically: true,
    },
  },
};
