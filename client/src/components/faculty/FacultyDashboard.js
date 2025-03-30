import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch notices created by the faculty
      const noticesRes = await axios.get('/api/notices', {
        params: { author: user.id },
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      // Fetch events organized by the faculty
      const eventsRes = await axios.get('/api/events', {
        params: { organizer: user.id },
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      setNotices(noticesRes.data.notices || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, token]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteClick = (e, id, type) => {
    e.stopPropagation(); // Prevent navigating to detail page
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete({ id: null, type: null });
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete.id || !itemToDelete.type) return;
    
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const endpoint = itemToDelete.type === 'notice' 
        ? `/api/notices/${itemToDelete.id}` 
        : `/api/events/${itemToDelete.id}`;
      
      await axios.delete(endpoint, {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });

      // Remove the item from state
      if (itemToDelete.type === 'notice') {
        setNotices(notices.filter(notice => notice._id !== itemToDelete.id));
      } else {
        setEvents(events.filter(event => event._id !== itemToDelete.id));
      }

      setDeleteDialogOpen(false);
      setItemToDelete({ id: null, type: null });
    } catch (err) {
      setDeleteError('Failed to delete. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getNoticeTypeColor = (type) => {
    switch (type) {
      case 'general':
        return 'primary';
      case 'academic':
        return 'success';
      case 'event':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'academic':
        return 'primary';
      case 'cultural':
        return 'secondary';
      case 'sports':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Faculty Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {user?.fullName || 'Faculty'}
              </Typography>
              <Typography variant="body2" paragraph>
                Division: {user?.division || 'Not specified'}
              </Typography>
              <Typography variant="body2" paragraph>
                Post: {user?.post || 'Not specified'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/profile')}
                sx={{ mt: 2 }}
              >
                View Profile
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/notices/create')}
                  >
                    Create Notice
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/events/create')}
                  >
                    Create Event
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/notices')}
                  >
                    View Notices
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/events')}
                  >
                    View Events
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="My Notices" />
            <Tab label="My Events" />
          </Tabs>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              {activeTab === 0 && (
                <>
                  {notices.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        You haven't created any notices yet.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/notices/create')}
                      >
                        Create Your First Notice
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {notices.map((notice, index) => (
                        <React.Fragment key={notice._id}>
                          <ListItem 
                            alignItems="flex-start" 
                            button 
                            onClick={() => navigate(`/notices/${notice._id}`)}
                            sx={{ pr: 10 }} // Make room for action buttons
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6" component="div">
                                    {notice.title}
                                  </Typography>
                                  <Chip 
                                    label={notice.type.charAt(0).toUpperCase() + notice.type.slice(1)} 
                                    color={getNoticeTypeColor(notice.type)}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ display: 'block', mt: 1 }}
                                  >
                                    {notice.content.length > 100 
                                      ? `${notice.content.substring(0, 100)}...` 
                                      : notice.content}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Department: {notice.department}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Posted on: {formatDate(notice.createdAt)}
                                    </Typography>
                                  </Box>
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                aria-label="edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/notices/${notice._id}/edit`);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={(e) => handleDeleteClick(e, notice._id, 'notice')}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < notices.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}
              
              {activeTab === 1 && (
                <>
                  {events.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        You haven't created any events yet.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/events/create')}
                      >
                        Create Your First Event
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {events.map((event, index) => (
                        <React.Fragment key={event._id}>
                          <ListItem 
                            alignItems="flex-start" 
                            button 
                            onClick={() => navigate(`/events/${event._id}`)}
                            sx={{ pr: 10 }} // Make room for action buttons
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6" component="div">
                                    {event.title}
                                  </Typography>
                                  <Chip 
                                    label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                                    color={getEventTypeColor(event.type)}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                    {formatDate(event.date)} • {event.startTime} - {event.endTime}
                                  </Typography>
                                  <Typography variant="body2" color="text.primary">
                                    Location: {event.location}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 1 }}
                                  >
                                    {event.description.length > 100 
                                      ? `${event.description.substring(0, 100)}...` 
                                      : event.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Department: {event.department}
                                  </Typography>
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                aria-label="edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/events/${event._id}/edit`);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={(e) => handleDeleteClick(e, event._id, 'event')}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < events.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          {`Confirm Delete`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={24} /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacultyDashboard; 