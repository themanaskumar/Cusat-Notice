import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Student fields
    firstName: '',
    lastName: '',
    branch: '',
    yearOfAdmission: '',
    // Faculty fields
    fullName: '',
    division: '',
    post: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { register, verifyEmail, resendVerification } = useAuth();

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Civil',
    'Mechanical',
    'Electrical',
    'Chemical',
    'Aerospace',
    'Marine',
    'Architecture',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Statistics',
  ];

  const divisions = [
    ...branches,
    'Exam Cell',
    'Administrative Office',
    'Library',
    'Hostel Office',
    'Placement Cell',
    'Research & Development',
    'International Relations',
    'Student Affairs',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.email.endsWith('cusat.ac.in')) {
      setError('Email must end with cusat.ac.in');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        ...(formData.role === 'student'
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              branch: formData.branch,
              yearOfAdmission: parseInt(formData.yearOfAdmission),
            }
          : {
              fullName: formData.fullName,
              division: formData.division,
              post: formData.post,
            }),
      };

      await register(userData, formData.role);
      setRegistrationSuccess(true);
      setActiveStep(1); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await verifyEmail(formData.email, otp);
      // Navigate to login page after successful verification
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    try {
      await resendVerification(formData.email);
      setError('A new OTP has been sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const steps = ['Registration', 'Email Verification'];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {registrationSuccess && activeStep === 1 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please verify your email with the OTP sent to {formData.email}.
            </Alert>
          )}

          {activeStep === 0 ? (
            <form onSubmit={handleRegister}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="faculty">Faculty</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    helperText="Must end with cusat.ac.in"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {formData.role === 'student' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Branch</InputLabel>
                        <Select
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          label="Branch"
                          required
                        >
                          {branches.map((branch) => (
                            <MenuItem key={branch} value={branch}>
                              {branch}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Year of Admission"
                        name="yearOfAdmission"
                        type="number"
                        value={formData.yearOfAdmission}
                        onChange={handleChange}
                        required
                        inputProps={{
                          min: 2000,
                          max: new Date().getFullYear(),
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Division</InputLabel>
                        <Select
                          name="division"
                          value={formData.division}
                          onChange={handleChange}
                          label="Division"
                          required
                        >
                          {divisions.map((division) => (
                            <MenuItem key={division} value={division}>
                              {division}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Post/Designation"
                        name="post"
                        value={formData.post}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Already have an account? Login
                </Button>
              </Box>
            </form>
          ) : (
            // OTP verification form
            <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                A 6-digit OTP has been sent to {formData.email}. Please enter it below to verify your email.
              </Typography>
              
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
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleResendOTP}
                  disabled={resending}
                >
                  {resending ? <CircularProgress size={24} /> : 'Resend OTP'}
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify Email'}
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
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 