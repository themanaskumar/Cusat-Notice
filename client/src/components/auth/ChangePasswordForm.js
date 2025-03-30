import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePasswordForm = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Debugging token
    const localStorageToken = localStorage.getItem('token');
    console.log('Initial check - Context token exists:', !!token);
    console.log('Initial check - LocalStorage token exists:', !!localStorageToken);

    // Set default header for all requests
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('Set default axios header with token');
    }
  }, [token, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword) {
      setAlert({
        open: true,
        message: 'All fields are required',
        severity: 'error'
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the token to use
      const contextToken = token;
      const localStorageToken = localStorage.getItem('token');
      const authToken = contextToken || localStorageToken;
      
      console.log('Debug - Context token exists:', !!contextToken);
      console.log('Debug - LocalStorage token exists:', !!localStorageToken);
      console.log('Debug - Using token:', !!authToken);
      
      if (!authToken) {
        throw new Error('You are not authenticated. Please log in again.');
      }
      
      console.log('Debug - Token first 20 chars:', authToken.substring(0, 20) + '...');
      
      const response = await axios.post('/api/auth/change-password', 
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'x-auth-token': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Debug - API Response:', response.status, response.data);
      
      setLoading(false);
      
      setAlert({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Debug - Password change error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      setLoading(false);
      setAlert({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to change password. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
        Change Password
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          name="currentPassword"
          label="Current Password"
          type="password"
          id="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="New Password"
          type="password"
          id="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </Box>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ChangePasswordForm; 