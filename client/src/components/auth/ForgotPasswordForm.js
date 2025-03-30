import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setAlert({
        open: true,
        message: 'Please enter your email',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/auth/forgot-password', { email: formData.email });
      setLoading(false);
      
      setAlert({
        open: true,
        message: 'OTP has been sent to your email',
        severity: 'success'
      });
      
      setActiveStep(1);
    } catch (error) {
      setLoading(false);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp) {
      setAlert({
        open: true,
        message: 'Please enter the OTP',
        severity: 'error'
      });
      return;
    }
    
    // Only verify OTP, don't reset password yet
    setActiveStep(2);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword) {
      setAlert({
        open: true,
        message: 'Please enter a new password',
        severity: 'error'
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setLoading(false);
      
      setAlert({
        open: true,
        message: 'Password reset successful. You can now log in with your new password.',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setLoading(false);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to reset password. Please try again.',
        severity: 'error'
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestOTP} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Request OTP'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Back to Login
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              sx={{ mt: 1 }}
            >
              Resend OTP
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
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
              label="Confirm Password"
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
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
        Forgot Password
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent()}
      
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

export default ForgotPasswordForm; 