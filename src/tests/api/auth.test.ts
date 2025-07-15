import { test, expect } from '@playwright/test';

test.describe('Auth API', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';

  test('should authenticate with valid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        username: 'testuser1',
        password: 'password123',
      },
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('username', 'testuser1');
  });

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        username: 'testuser1',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should validate token', async ({ request }) => {
    // First, get a valid token
    const loginResponse = await request.post(`${baseURL}/auth/login`, {
      data: {
        username: 'testuser1',
        password: 'password123',
      },
    });

    const { token } = await loginResponse.json();

    // Then validate it
    const validateResponse = await request.get(`${baseURL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(validateResponse.status()).toBe(200);
    
    const data = await validateResponse.json();
    expect(data).toHaveProperty('valid', true);
  });

  test('should logout successfully', async ({ request }) => {
    // First, get a valid token
    const loginResponse = await request.post(`${baseURL}/auth/login`, {
      data: {
        username: 'testuser1',
        password: 'password123',
      },
    });

    const { token } = await loginResponse.json();

    // Then logout
    const logoutResponse = await request.post(`${baseURL}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(logoutResponse.status()).toBe(200);
  });
});