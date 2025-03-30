import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    }
    checkAuth();
  }, [token]);

  const checkAuth = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user } = res.data;
      
      console.log("User data from login:", user);
      
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['x-auth-token'] = newToken;
      setToken(newToken);
      
      // Fetch complete user data
      const userDataRes = await axios.get('/api/auth/me');
      console.log("Complete user data:", userDataRes.data);
      
      setUser(userDataRes.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error.response.data;
    }
  };

  const register = async (userData, role) => {
    try {
      const res = await axios.post(`/api/auth/register/${role}`, userData);
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await axios.post('/api/auth/verify-email', { email, otp });
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await axios.post('/api/auth/resend-verification', { email });
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification
      }}
    >
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