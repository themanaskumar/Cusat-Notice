import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

const CreateNotice = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetAudience: 'all',
    department: 'All Departments',
    expiryDate: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Check if adding these files would exceed the limit
    if (attachments.length + files.length > 2) {
      alert('You can upload a maximum of 2 files');
      return;
    }
    
    // Check file sizes
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 5MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setAttachments(prevAttachments => [...prevAttachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prevAttachments => 
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  const getFileIcon = (file) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PictureAsPdfIcon />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DescriptionIcon />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Create form data to handle file uploads
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('content', formData.content);
    formDataToSubmit.append('type', formData.type);
    formDataToSubmit.append('department', formData.department);
    
    // Add attachments
    attachments.forEach(file => {
      formDataToSubmit.append('attachments', file);
    });
    
    console.log('Submitting notice data with', attachments.length, 'attachments');
    
    try {
      await axios.post('/api/notices', formDataToSubmit, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'general',
        department: 'All Departments'
      });
      setAttachments([]);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/notices');
      }, 2000);
    } catch (err) {
      console.error('Error details:', err);
      setError(
        err.response?.data?.message || 
        (err.response?.data?.errors && JSON.stringify(err.response.data.errors)) || 
        `Error ${err.response?.status || ''}: ${err.message || 'Failed to create notice'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Set a minimum date for the expiry date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Notice
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Notice created successfully! Redirecting...
            </Alert>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : null}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Notice Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Notice Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={6}
              margin="normal"
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Notice Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Notice Type"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  label="Department"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="All Departments">All Departments</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Information Technology">Information Technology</MenuItem>
                  <MenuItem value="Electronics & Communication">Electronics & Communication</MenuItem>
                  <MenuItem value="Civil">Civil</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="Chemical">Chemical</MenuItem>
                  <MenuItem value="Aerospace">Aerospace</MenuItem>
                  <MenuItem value="Marine">Marine</MenuItem>
                  <MenuItem value="Architecture">Architecture</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Statistics">Statistics</MenuItem>
                  <MenuItem value="Exam Cell">Exam Cell</MenuItem>
                  <MenuItem value="Administrative Office">Administrative Office</MenuItem>
                  <MenuItem value="Library">Library</MenuItem>
                  <MenuItem value="Hostel Office">Hostel Office</MenuItem>
                  <MenuItem value="Placement Cell">Placement Cell</MenuItem>
                  <MenuItem value="Research & Development">Research & Development</MenuItem>
                  <MenuItem value="International Relations">International Relations</MenuItem>
                  <MenuItem value="Student Affairs">Student Affairs</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: minDate
              }}
              helperText="Optional"
            />
            
            {/* File Upload Section */}
            <Box sx={{ mt: 3, border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1">Attachments</Typography>
              
              <input
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                id="attachment-files"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Button
                  component="label"
                  htmlFor="attachment-files"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                >
                  Add Attachments
                </Button>
                <Typography variant="caption" sx={{ ml: 2 }}>
                  Upload up to 2 files (5MB each) - Images, PDFs, or Office documents
                </Typography>
              </Box>
              
              {attachments.length > 0 && (
                <List dense>
                  {attachments.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeAttachment(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                type="button" 
                onClick={() => navigate('/notices')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Notice'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateNotice; 