import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:8000/api';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  serverError: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        serverError: false
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        serverError: false
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    case 'SERVER_ERROR':
      return {
        ...state,
        loading: false,
        serverError: true,
        isAuthenticated: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      await axios.get(`${API_URL}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Server connection test failed:', error.message);
      return false;
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }

    // Test server connection first
    const serverOnline = await testServerConnection();
    if (!serverOnline) {
      dispatch({ type: 'SERVER_ERROR' });
      return;
    }

    setAuthToken(token);

    try {
      const res = await axios.get(`${API_URL}/auth/me`, { timeout: 5000 });
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
    } catch (err) {
      console.error('Load user error:', err);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      // Test server connection first
      const serverOnline = await testServerConnection();
      if (!serverOnline) {
        throw new Error('Server is not available. Please make sure the backend is running on port 8000.');
      }

      const res = await axios.post(`${API_URL}/auth/register`, formData, { timeout: 10000 });
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
      
      // Set token and load user data
      setAuthToken(res.data.token);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.user
      });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL' });
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000.');
      }
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      // Test server connection first
      const serverOnline = await testServerConnection();
      if (!serverOnline) {
        throw new Error('Server is not available. Please make sure the backend is running on port 8000.');
      }

      const res = await axios.post(`${API_URL}/auth/login`, formData, { timeout: 10000 });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });
      
      // Set token and load user data
      setAuthToken(res.data.token);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.user
      });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL' });
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000.');
      }
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // Update user
  const updateUser = (user) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: user
    });
  };

  useEffect(() => {
    // Only try to load user if we have a token
    if (localStorage.getItem('token')) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateUser,
        testServerConnection
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