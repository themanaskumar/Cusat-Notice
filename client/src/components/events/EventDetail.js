import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (!res.data) {
          throw new Error('Event not found');
        }

        setEvent(res.data);
      } catch (err) {
        setError('Failed to fetch event details. Please try again.');
        console.error('Error fetching event:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, API_URL]);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      navigate('/events');
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err.message);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getTypeColor = (type) => {
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const canEditOrDelete = () => {
    if (!user || !event) return false;

    // Admin can edit/delete any event
    if (user.role === 'admin') return true;

    // Faculty can only edit/delete their own events
    if (user.role === 'faculty' && event.organizer && event.organizer._id === user.id) {
      return true;
    }

    return false;
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <ImageIcon />;
    } else if (extension === 'pdf') {
      return <PictureAsPdfIcon />;
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <DescriptionIcon />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : event ? (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {event.title}
              </Typography>
              <Chip 
                label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                color={getTypeColor(event.type)}
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong> {formatDate(event.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Time:</strong> {formatTime(event.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Location:</strong> {event.location}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Organized by:</strong>{' '}
                  {event.organizer
                    ? `${event.organizer.fullName || ''} ${event.organizer.division ? `(${event.organizer.division})` : ''}`
                    : 'Unknown'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {event.description}
            </Typography>

            {event.attachments && event.attachments.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {event.attachments.map((attachment, index) => (
                    <ListItem
                      key={index}
                      button
                      component="a"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        {getFileIcon(attachment.filename)}
                      </ListItemIcon>
                      <ListItemText primary={attachment.filename} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => navigate('/events')}>
                Back to Events
              </Button>

              {canEditOrDelete() && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" color="primary" onClick={() => navigate(`/events/edit/${id}`)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)}>
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        ) : (
          <Alert severity="info">Event not found.</Alert>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this event? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetail;
