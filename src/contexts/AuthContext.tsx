import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { AuthService } from '@/services/auth.service';
import { JWTManager } from '@/utils/jwt.utils';
import type { AuthState, User, LoginCredentials, SignupCredentials } from '@/types/auth.types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const loadUser = useCallback(async () => {
    try {
      // First, try to get the session - this won't throw if user is not authenticated
      const session = await fetchAuthSession();
      
      // Check if we have valid tokens before trying to get current user
      if (!session.tokens?.accessToken || !session.tokens?.idToken) {
        console.log('No valid session found');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Now we know we have a session, get the current user
      try {
        const { username, userId, signInDetails } = await getCurrentUser();
        
        // DEBUG: Log both tokens
        console.log('Session tokens:', {
          hasAccessToken: !!session.tokens?.accessToken,
          hasIdToken: !!session.tokens?.idToken,
          accessTokenSample: session.tokens?.accessToken?.toString().substring(0, 50) + '...',
          idTokenSample: session.tokens?.idToken?.toString().substring(0, 50) + '...'
        });
        
        // CRITICAL: Use ID token for API calls
        JWTManager.setTokens(
          session.tokens.idToken.toString(),    // This MUST be first
          session.tokens.accessToken.toString()
        );

        // Decode and log the ID token to verify claims
        const idTokenPayload = JWTManager.decodeToken(session.tokens.idToken.toString());
        console.log('ID Token claims:', idTokenPayload);

        const user: User = {
          id: userId,
          email: signInDetails?.loginId || username,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (userError) {
        console.error('Error getting current user:', userError);
        // Session exists but user data couldn't be fetched
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.log('No active session:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { isSignedIn } = await AuthService.login(credentials);
      if (isSignedIn) {
        // Small delay to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadUser();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { nextStep } = await AuthService.signup(credentials);
      setState(prev => ({ ...prev, isLoading: false }));
      return { needsVerification: nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await AuthService.verifyEmail(email, code);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await AuthService.logout();
      JWTManager.clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  const requestPasswordReset = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await AuthService.requestPasswordReset(email);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset request failed',
      }));
      throw error;
    }
  };

  const confirmPasswordReset = async (email: string, code: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await AuthService.confirmPasswordReset(email, code, newPassword);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      verifyEmail,
      logout,
      requestPasswordReset,
      confirmPasswordReset,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};