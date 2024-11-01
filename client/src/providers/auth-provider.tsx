import {
  FORGOT_PASSWORD,
  GET_CURRENT_USER,
  LOGIN_USER,
  REGISTER_USER,
  RESET_PASSWORD,
} from '@/graphql/auth';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '@/types/auth';
import { useMutation, useQuery } from '@apollo/client';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  forgotPassword: (input: ForgotPasswordInput) => Promise<void>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { loading: isLoading } = useQuery(GET_CURRENT_USER, {
    onCompleted: (data) => setUser(data.currentUser),
  });

  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);
  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD);
  const [resetPasswordMutation] = useMutation(RESET_PASSWORD);

  const login = async (input: LoginInput) => {
    const { data } = await loginMutation({ variables: { input } });
    localStorage.setItem('token', data.login.token);
    setUser(data.login.user);
    navigate('/');
  };

  const register = async (input: RegisterInput) => {
    const { data } = await registerMutation({ variables: { input } });
    localStorage.setItem('token', data.register.token);
    setUser(data.register.user);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const forgotPassword = async (input: ForgotPasswordInput) => {
    const { data } = await forgotPasswordMutation({ variables: { input } });
    if (!data.forgotPassword.success) {
      throw new Error(data.forgotPassword.message);
    }
  };

  const resetPassword = async (input: ResetPasswordInput) => {
    const { data } = await resetPasswordMutation({ variables: { input } });
    localStorage.setItem('token', data.resetPassword.token);
    setUser(data.resetPassword.user);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
