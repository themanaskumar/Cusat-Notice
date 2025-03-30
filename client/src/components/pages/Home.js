import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <Box 
      sx={{ 
        backgroundImage: `url('/Images/cusatbg.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '91.5vh',
        paddingY: 4
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            my: 4, 
            backgroundColor: 'rgba(63, 63, 63, 0.5)',
            backdropFilter: 'blur(7px)',
            padding: 4,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom align="center" color="white">
            CUSAT Digital Notice Board
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center" color="white">
            Your one-stop platform for all notices and events at Cochin University of Science and Technology
          </Typography>

          {!isAuthenticated ? (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={() => navigate('/register')}
                
              >
                Register
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/notices')}
              >
                View Notices
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => navigate('/events')}
              >
                View Events
              </Button>
            </Box>
          )}

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Latest Notices
                </Typography>
                <Typography paragraph>
                  Stay updated with the latest announcements, circulars, and notifications from the university.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => navigate('/notices')}
                >
                  View All Notices
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                <Typography paragraph>
                  Don't miss out on seminars, workshops, cultural events, and other activities happening on campus.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => navigate('/events')}
                >
                  View Calendar
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Faculty Portal
                </Typography>
                <Typography paragraph>
                  Faculty members can publish notices, schedule events, and manage their department's information.
                </Typography>
                {user && user.role === 'faculty' && (
                  <Button 
                    variant="text" 
                    color="primary"
                    onClick={() => navigate('/faculty/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 