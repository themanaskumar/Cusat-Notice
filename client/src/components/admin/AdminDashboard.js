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
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState({ students: [], faculty: [] });
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all users
      const usersRes = await axios.get('/api/admin/users', {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      // Fetch faculty verification requests
      const requestsRes = await axios.get('/api/admin/verification-requests', {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      setUsers(usersRes.data);
      setVerificationRequests(requestsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get('/api/notices', {
        params: { page, limit: 10 },
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      setNotices(res.data.notices || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch notices. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get('/api/events', {
        params: { page, limit: 10 },
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      setEvents(res.data.events || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab < 3) {
      fetchData();
    } else if (activeTab === 3) {
      fetchNotices();
    } else if (activeTab === 4) {
      fetchEvents();
    }
  }, [activeTab, page]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm(''); // Reset search when changing tabs
    setPage(1); // Reset pagination when changing tabs
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filterStudents = () => {
    if (!searchTerm) return users.students;
    
    return users.students.filter(student => 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterFaculty = () => {
    if (!searchTerm) return users.faculty;
    
    return users.faculty.filter(faculty => 
      faculty.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.post.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterNotices = () => {
    if (!searchTerm) return notices;
    
    return notices.filter(notice => 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterEvents = () => {
    if (!searchTerm) return events;
    
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const openRoleDialog = (user, currentRole) => {
    setSelectedUser({ ...user, role: currentRole });
    setNewRole(currentRole);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id, type) => {
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

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setProcessing(true);
    
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/role`, {
        role: newRole
      }, {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      // Update local state
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        
        if (selectedUser.role === 'student' && newRole === 'faculty') {
          // Move from students to faculty
          updatedUsers.students = updatedUsers.students.filter(s => s._id !== selectedUser._id);
          updatedUsers.faculty.push({ ...selectedUser, role: 'faculty' });
        } else if (selectedUser.role === 'faculty' && newRole === 'student') {
          // Move from faculty to students
          updatedUsers.faculty = updatedUsers.faculty.filter(f => f._id !== selectedUser._id);
          updatedUsers.students.push({ ...selectedUser, role: 'student' });
        } else if (newRole === 'admin') {
          // Update isAdmin flag
          if (selectedUser.role === 'student') {
            const index = updatedUsers.students.findIndex(s => s._id === selectedUser._id);
            if (index !== -1) {
              updatedUsers.students[index].isAdmin = true;
            }
          } else {
            const index = updatedUsers.faculty.findIndex(f => f._id === selectedUser._id);
            if (index !== -1) {
              updatedUsers.faculty[index].isAdmin = true;
            }
          }
        }
        
        return updatedUsers;
      });
      
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to update user role. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId, role) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      // Update local state
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        
        if (role === 'student') {
          updatedUsers.students = updatedUsers.students.filter(s => s._id !== userId);
        } else {
          updatedUsers.faculty = updatedUsers.faculty.filter(f => f._id !== userId);
        }
        
        return updatedUsers;
      });
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error(err);
    }
  };

  const handleVerificationAction = async (requestId, action) => {
    try {
      await axios.put(`/api/admin/verification-requests/${requestId}/${action}`, {}, {
        headers: {
          'x-auth-token': token || localStorage.getItem('token')
        }
      });
      
      // Update local state
      setVerificationRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );
      
      // If approved, refresh faculty list
      if (action === 'approve') {
        const usersRes = await axios.get('/api/admin/users', {
          headers: {
            'x-auth-token': token || localStorage.getItem('token')
          }
        });
        
        setUsers(usersRes.data);
      }
    } catch (err) {
      setError(`Failed to ${action} verification request. Please try again.`);
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome, {user?.fullName || 'Admin'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Post: {user?.post || 'Not specified'}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Administrative Access
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Manage users, approve faculty verification requests, and oversee system-wide content.
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Paper elevation={3} sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Students" />
            <Tab label="Faculty" />
            <Tab label="Verification Requests" />
            <Tab label="Manage Notices" />
            <Tab label="Manage Events" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {/* Search bar for filtering */}
            {activeTab !== 2 && (
              <TextField
                fullWidth
                variant="outlined"
                placeholder={
                  activeTab === 0 ? "Search students by name, email, or branch..." :
                  activeTab === 1 ? "Search faculty by name, email, division, or post..." :
                  activeTab === 3 ? "Search notices..." :
                  "Search events..."
                }
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={clearSearch} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
            
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
                {/* Students Tab */}
                {activeTab === 0 && (
                  <>
                    {filterStudents().length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm ? 'No students match your search.' : 'No students registered yet.'}
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {filterStudents().map((student, index) => (
                          <React.Fragment key={student._id}>
                            <ListItem alignItems="flex-start">
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" component="div">
                                      {student.firstName} {student.lastName}
                                      {student.isAdmin && (
                                        <Chip 
                                          label="Admin" 
                                          color="secondary"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Typography>
                                    <Box>
                                      <Button
                                        size="small"
                                        onClick={() => openRoleDialog(student, 'student')}
                                        sx={{ mr: 1 }}
                                      >
                                        Change Role
                                      </Button>
                                      <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteUser(student._id, 'student')}
                                      >
                                        Delete
                                      </Button>
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Email: {student.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Branch: {student.branch}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Year of Admission: {student.yearOfAdmission}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Email Verified: {student.isEmailVerified ? 'Yes' : 'No'}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                            {index < filterStudents().length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                )}
                
                {/* Faculty Tab */}
                {activeTab === 1 && (
                  <>
                    {filterFaculty().length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm ? 'No faculty members match your search.' : 'No faculty registered yet.'}
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {filterFaculty().map((faculty, index) => (
                          <React.Fragment key={faculty._id}>
                            <ListItem alignItems="flex-start">
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" component="div">
                                      {faculty.fullName}
                                      {faculty.isAdmin && (
                                        <Chip 
                                          label="Admin" 
                                          color="secondary"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                      {!faculty.isVerified && (
                                        <Chip 
                                          label="Not Verified" 
                                          color="warning"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Typography>
                                    <Box>
                                      <Button
                                        size="small"
                                        onClick={() => openRoleDialog(faculty, 'faculty')}
                                        sx={{ mr: 1 }}
                                      >
                                        Change Role
                                      </Button>
                                      <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteUser(faculty._id, 'faculty')}
                                      >
                                        Delete
                                      </Button>
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Email: {faculty.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Division: {faculty.division}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Post: {faculty.post}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Email Verified: {faculty.isEmailVerified ? 'Yes' : 'No'}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                            {index < filterFaculty().length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                )}
                
                {/* Verification Requests Tab */}
                {activeTab === 2 && (
                  <>
                    {verificationRequests.length === 0 ? (
                      <Typography color="text.secondary">
                        No verification requests pending.
                      </Typography>
                    ) : (
                      <List>
                        {verificationRequests.map((request) => (
                          <React.Fragment key={request._id}>
                            <ListItem alignItems="flex-start">
                              <ListItemText
                                primary={
                                  <Typography variant="h6">
                                    {request.faculty.fullName}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.primary">
                                      Email: {request.faculty.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                      Division: {request.faculty.division}
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                      Post: {request.faculty.post}
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                      Notes: {request.notes || 'No notes provided'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Requested on: {formatDate(request.createdAt)}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleVerificationAction(request._id, 'approve')}
                                        sx={{ mr: 2 }}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleVerificationAction(request._id, 'reject')}
                                      >
                                        Reject
                                      </Button>
                                    </Box>
                                  </>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                )}
                
                {/* Manage Notices Tab */}
                {activeTab === 3 && (
                  <>
                    {filterNotices().length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No notices found.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <List>
                          {filterNotices().map((notice, index) => (
                            <React.Fragment key={notice._id}>
                              <ListItem 
                                alignItems="flex-start" 
                                button 
                                onClick={() => navigate(`/notices/${notice._id}`)}
                                sx={{ pr: 10 }}
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
                                          Posted by: {notice.author && (notice.author.fullName || `${notice.author.firstName || ''} ${notice.author.lastName || ''}`)} 
                                          {notice.author && notice.author.division && ` (${notice.author.division})`}
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
                                    aria-label="delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(notice._id, 'notice');
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < filterNotices().length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))}
                        </List>
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
                  </>
                )}
                
                {/* Manage Events Tab */}
                {activeTab === 4 && (
                  <>
                    {filterEvents().length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No events found.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <List>
                          {filterEvents().map((event, index) => (
                            <React.Fragment key={event._id}>
                              <ListItem 
                                alignItems="flex-start" 
                                button 
                                onClick={() => navigate(`/events/${event._id}`)}
                                sx={{ pr: 10 }}
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
                                        Organized by: {event.organizer && (event.organizer.fullName || `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`)}
                                        {event.organizer && event.organizer.division && ` (${event.organizer.division})`}
                                      </Typography>
                                    </>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    edge="end" 
                                    aria-label="delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(event._id, 'event');
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < filterEvents().length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))}
                        </List>
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
                  </>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Role Change Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a new role for {selectedUser?.firstName || selectedUser?.fullName || 'this user'}.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={processing || newRole === selectedUser?.role}>
            {processing ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminDashboard; 