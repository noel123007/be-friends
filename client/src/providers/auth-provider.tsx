import { GET_CURRENT_USER, LOGIN_USER, REGISTER_USER } from '@/graphql/auth';
import type { LoginInput, RegisterInput, User } from '@/types/auth';
import { handleGraphQLError } from '@/utils/error-handler';
import { useMutation, useQuery } from '@apollo/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { loading: isLoading } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem('token'),
    onCompleted: (data) => {
      setUser(data.currentUser);
      setIsInitializing(false);
    },
    onError: () => {
      localStorage.removeItem('token');
      setUser(null);
      setIsInitializing(false);
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) setIsInitializing(false);
  }, []);

  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);

  const { t } = useTranslation();

  const login = async (input: LoginInput) => {
    const { data } = await loginMutation({ variables: { input } });
    localStorage.setItem('token', data.login.token);
    setUser(data.login.user);
    navigate('/');
  };

  const register = async (input: RegisterInput) => {
    try {
      const { data } = await registerMutation({ variables: { input } });
      localStorage.setItem('token', data.register.token);
      setUser(data.register.user);
      navigate('/');
    } catch (error) {
      const errorMessage = handleGraphQLError(error, t);
      throw new Error(errorMessage.description);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isLoading: isLoading || isInitializing,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    login,
    register,
    logout,
  };

  if (isInitializing) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
