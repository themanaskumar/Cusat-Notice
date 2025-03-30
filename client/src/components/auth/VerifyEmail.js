import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Alert, 
  TextField
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !otp) {
      setError('Please enter both email address and OTP');
      return;
    }

    setVerifying(true);
    setError('');
    
    try {
      await verifyEmail(email, otp);
      setVerified(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResending(true);
    setError('');
    setResendSuccess(false);
    
    try {
      await resendVerification(email);
      setResendSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Email Verification
          </Typography>

          {verified ? (
            <>
              <Alert severity="success" sx={{ my: 2 }}>
                Your email has been successfully verified!
              </Alert>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                >
                  Proceed to Login
                </Button>
              </Box>
            </>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ my: 2 }}>
                  {error}
                </Alert>
              )}
              
              {resendSuccess && (
                <Alert severity="success" sx={{ my: 2 }}>
                  A new OTP has been sent to your email.
                </Alert>
              )}

              <Typography variant="body1" paragraph>
                Please enter the 6-digit OTP sent to your email to verify your account.
              </Typography>

              <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 3 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
                
                <TextField
                  label="OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ maxLength: 6 }}
                  placeholder="Enter 6-digit OTP"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  disabled={verifying}
                >
                  {verifying ? <CircularProgress size={24} /> : 'Verify Email'}
                </Button>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" align="center" gutterBottom>
                  Didn't receive the OTP?
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleResendVerification}
                  disabled={resending || !email}
                >
                  {resending ? <CircularProgress size={24} /> : 'Resend OTP'}
                </Button>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 