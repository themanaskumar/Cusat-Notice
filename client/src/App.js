import React from 'react';
import { Routes, Route, createRoutesFromElements, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme, useMediaQuery, Box } from '@mui/material';

// Components
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ChangePasswordForm from './components/auth/ChangePasswordForm';
import NoticeList from './components/notices/NoticeList';
import NoticeDetail from './components/notices/NoticeDetail';
import CreateNotice from './components/notices/CreateNotice';
import EventCalendar from './components/events/EventCalendar';
import EventDetail from './components/events/EventDetail';
import CreateEvent from './components/events/CreateEvent';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// App Layout component
function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <div className="App">
      <Navbar />
      <Box sx={{ 
        paddingTop: isMobile ? '56px' : '64px', // Mobile navbar is 56px, desktop is 64px
      }}>
        <Outlet />
      </Box>
    </div>
  );
}

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route path="change-password" element={<ChangePasswordForm />} />
        <Route path="notices">
          <Route index element={<NoticeList />} />
          <Route path=":id" element={<NoticeDetail />} />
          <Route path="create" element={<CreateNotice />} />
        </Route>
        <Route path="events">
          <Route index element={<EventCalendar />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path="create" element={<CreateEvent />} />
        </Route>
        <Route path="faculty/dashboard" element={<FacultyDashboard />} />
      </Route>
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 