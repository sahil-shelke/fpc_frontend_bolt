import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'regional_manager' | 'project_manager' | 'fpc_user' | 'agribusiness_officer';
  region?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // Call actual login API
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });

      const { access_token } = response.data;
      
      // Decode JWT token to get user info (you might want to use a proper JWT library)
      const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
      
      // Map role_id to role names
      const roleMap: { [key: number]: 'super_admin' | 'regional_manager' | 'project_manager' | 'fpc_user' | 'agribusiness_officer' } = {
        1: 'super_admin',
        2: 'regional_manager', 
        3: 'project_manager',
        4: 'fpc_user',
        5: 'agribusiness_officer'
      };

      const user: User = {
        id: tokenPayload.email, // Using email as ID since that's what we have
        email: tokenPayload.email,
        firstName: 'User', // You might want to fetch this from a separate API call
        lastName: 'Name',
        role: roleMap[tokenPayload.role] || 'fpc_user',
        region: 'Region', // You might want to fetch this from user profile
        isActive: true
      };
      
      setUser(user);
      setToken(access_token);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};