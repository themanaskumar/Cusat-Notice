import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError('');
      
      try {
        const params = { page };
        if (type !== 'all') {
          params.type = type;
        }
        
        const res = await axios.get('/api/notices', { 
          params,
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setNotices(res.data.notices);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError('Failed to fetch notices. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [type, page]);

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notices
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={type}
              label="Filter by Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="all">All Notices</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </Select>
          </FormControl>

          {(user?.role === 'faculty' || user?.role === 'admin') && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/notices/create')}
            >
              Create Notice
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : notices.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No notices found. Please try a different filter.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper elevation={2}>
              <List>
                {notices.map((notice, index) => (
                  <React.Fragment key={notice._id}>
                    <ListItem 
                      alignItems="flex-start" 
                      button 
                      onClick={() => navigate(`/notices/${notice._id}`)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" component="div">
                              {notice.title}
                            </Typography>
                            <Chip 
                              label={notice.type.charAt(0).toUpperCase() + notice.type.slice(1)} 
                              color={getTypeColor(notice.type)}
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
                              {notice.content.length > 150 
                                ? `${notice.content.substring(0, 150)}...` 
                                : notice.content}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                By: {notice.author ? (notice.author.fullName || `${notice.author.firstName || ''} ${notice.author.lastName || ''}`) : ''}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notice.createdAt)}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {index < notices.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default NoticeList; 