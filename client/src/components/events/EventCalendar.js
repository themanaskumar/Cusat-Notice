import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      
      try {
        const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        
        const params = { 
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
        
        if (type !== 'all') {
          params.type = type;
        }
        
        const res = await axios.get('/api/events', { 
          params,
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setEvents(res.data.events || []);
      } catch (err) {
        setError('Failed to fetch events. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    generateCalendarDays();
  }, [type, selectedMonth]);

  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    setCalendarDays(days);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
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

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const isToday = (date) => {
    if (!date) return false;
    
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Event Calendar
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              views={['year', 'month']}
              label="Year and Month"
              value={selectedMonth}
              onChange={handleMonthChange}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={type}
                label="Event Type"
                onChange={handleTypeChange}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {(user?.role === 'faculty' || user?.role === 'admin') && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/events/create')}
            >
              Create Event
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
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Grid container>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Grid item xs={12/7} key={index}>
                      <Box sx={{ p: 1, textAlign: 'center', fontWeight: 'bold' }}>
                        {day}
                      </Box>
                    </Grid>
                  ))}
                  
                  {calendarDays.map((date, index) => (
                    <Grid item xs={12/7} key={index}>
                      {date ? (
                        <Box 
                          sx={{ 
                            p: 1, 
                            height: 80, 
                            border: '1px solid #eee',
                            backgroundColor: isSelected(date) ? '#e3f2fd' : isToday(date) ? '#fff8e1' : 'white',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                          onClick={() => handleDateClick(date)}
                        >
                          <Typography variant="body2" sx={{ fontWeight: isToday(date) ? 'bold' : 'normal' }}>
                            {date.getDate()}
                          </Typography>
                          
                          {getEventsForDate(date).length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {getEventsForDate(date).length <= 2 ? (
                                getEventsForDate(date).map((event, i) => (
                                  <Chip 
                                    key={i}
                                    label={event.title.substring(0, 10) + (event.title.length > 10 ? '...' : '')}
                                    size="small"
                                    color={getTypeColor(event.type)}
                                    sx={{ mb: 0.5, maxWidth: '100%' }}
                                  />
                                ))
                              ) : (
                                <Chip 
                                  label={`${getEventsForDate(date).length} events`}
                                  size="small"
                                  color="primary"
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ p: 1, height: 80, backgroundColor: '#f9f9f9', border: '1px solid #eee' }} />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Events on {selectedDate.toLocaleDateString()}
                </Typography>
                
                {getEventsForDate(selectedDate).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No events scheduled for this day.
                  </Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {getEventsForDate(selectedDate).map((event, index) => (
                      <Card key={index} sx={{ mb: 2 }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="div">
                              {event.title}
                            </Typography>
                            <Chip 
                              label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                              color={getTypeColor(event.type)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {formatTime(event.date)} • {event.location}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {event.description.length > 100 
                              ? `${event.description.substring(0, 100)}...` 
                              : event.description}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => navigate(`/events/${event._id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default EventCalendar; 