import { Amplify } from '@aws-amplify/core';
import { signIn, signUp, confirmSignUp, signOut, resetPassword, confirmResetPassword } from '@aws-amplify/auth';
import type { LoginCredentials, SignupCredentials } from '@/types/auth.types';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code',
      loginWith: { email: true },
    },
  },
});

console.log('Amplify config ➜', Amplify.getConfig());

export class AuthService {
  static async login(credentials: LoginCredentials) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('Please verify your email before logging in');
      }

      return { isSignedIn, nextStep };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async signup(credentials: SignupCredentials) {
    try {
      const { userId, isSignUpComplete, nextStep } = await signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
          },
        },
      });

      return { userId, isSignUpComplete, nextStep };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async verifyEmail(email: string, code: string) {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      return { isSignUpComplete };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async logout() {
    try {
      await signOut();
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async requestPasswordReset(email: string) {
    try {
      const output = await resetPassword({ username: email });
      return output;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async confirmPasswordReset(email: string, code: string, newPassword: string) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private static handleAuthError(error: any): Error {
    if (error.name === 'UserNotFoundException') {
      return new Error('No account found with this email');
    }
    if (error.name === 'NotAuthorizedException') {
      return new Error('Invalid email or password');
    }
    if (error.name === 'UserNotConfirmedException') {
      return new Error('Please verify your email before logging in');
    }
    if (error.name === 'CodeMismatchException') {
      return new Error('Invalid verification code');
    }
    if (error.name === 'ExpiredCodeException') {
      return new Error('Verification code has expired');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}