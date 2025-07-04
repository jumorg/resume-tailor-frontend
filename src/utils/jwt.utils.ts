import type { TokenPayload } from '@/types/auth.types';

export class JWTManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static tokens = new Map<string, string>();

  static setTokens(accessToken: string, refreshToken: string) {
    // Store in memory only, not localStorage
    this.tokens.set(this.ACCESS_TOKEN_KEY, accessToken);
    this.tokens.set(this.REFRESH_TOKEN_KEY, refreshToken);
    
    // Setup auto-logout on token expiration
    const payload = this.decodeToken(accessToken);
    if (payload?.exp) {
      const expiresIn = (payload.exp * 1000) - Date.now();
      setTimeout(() => {
        this.clearTokens();
        window.location.href = '/login';
      }, Math.max(0, expiresIn - 60000)); // Logout 1 min before expiry
    }
  }

  static getAccessToken(): string | null {
    return this.tokens.get(this.ACCESS_TOKEN_KEY) || null;
  }

  static getRefreshToken(): string | null {
    return this.tokens.get(this.REFRESH_TOKEN_KEY) || null;
  }

  static clearTokens() {
    this.tokens.clear();
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }
}