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

const NoticeDetail = () => {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await axios.get(`/api/notices/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setNotice(res.data);
      } catch (err) {
        setError('Failed to fetch notice details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      await axios.delete(`/api/notices/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      navigate('/notices');
    } catch (err) {
      setError('Failed to delete notice. Please try again.');
      console.error(err);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getTypeColor = (type) => {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const canEditOrDelete = () => {
    if (!user || !notice) return false;
    
    // Admin can edit/delete any notice
    if (user.role === 'admin') return true;
    
    // Faculty can only edit/delete their own notices
    if (user.role === 'faculty' && notice.author && notice.author._id === user.id) {
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
        ) : notice ? (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {notice.title}
              </Typography>
              <Chip 
                label={notice.type.charAt(0).toUpperCase() + notice.type.slice(1)} 
                color={getTypeColor(notice.type)}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Posted by: {notice.author ? (notice.author.fullName || `${notice.author.firstName || ''} ${notice.author.lastName || ''}`) : ''}
                {notice.author?.division && `, ${notice.author.division}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(notice.createdAt)}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {notice.content}
            </Typography>
            
            {notice.attachments && notice.attachments.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {notice.attachments.map((attachment, index) => (
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
              <Button
                variant="outlined"
                onClick={() => navigate('/notices')}
              >
                Back to Notices
              </Button>
              
              {canEditOrDelete() && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/notices/edit/${id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        ) : (
          <Alert severity="info">
            Notice not found.
          </Alert>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Notice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NoticeDetail; 