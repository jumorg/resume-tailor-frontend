import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JWTManager } from '../jwt.utils';

describe('JWTManager', () => {
  beforeEach(() => {
    JWTManager.clearTokens();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it('stores and retrieves tokens', () => {
    const accessToken = 'mock.access.token';
    const refreshToken = 'mock.refresh.token';
    
    JWTManager.setTokens(accessToken, refreshToken);
    
    expect(JWTManager.getAccessToken()).toBe(accessToken);
    expect(JWTManager.getRefreshToken()).toBe(refreshToken);
  });

  it('clears tokens', () => {
    JWTManager.setTokens('access', 'refresh');
    JWTManager.clearTokens();
    
    expect(JWTManager.getAccessToken()).toBeNull();
    expect(JWTManager.getRefreshToken()).toBeNull();
  });

  it('decodes valid JWT token', () => {
    // Mock JWT token with payload { sub: '123', email: 'test@example.com', exp: 1234567890 }
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjEyMzQ1Njc4OTB9.signature';
    
    const payload = JWTManager.decodeToken(mockToken);
    
    expect(payload).toMatchObject({
      sub: '123',
      email: 'test@example.com',
      exp: 1234567890,
    });
  });

  it('returns null for invalid token', () => {
    const payload = JWTManager.decodeToken('invalid.token');
    expect(payload).toBeNull();
  });

  it('checks token expiration', () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDAwMDAwMDB9.signature';
    const futureToken = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.signature';
    
    expect(JWTManager.isTokenExpired(expiredToken)).toBe(true);
    expect(JWTManager.isTokenExpired(futureToken)).toBe(false);
  });
});