import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setUserMenuAnchorEl(null);
    setAnchorEl(null);
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  // Functions to get initial letter for avatar from user name
  const getUserInitial = () => {
    if (user) {
      if (user.role === 'faculty' && user.fullName) {
        return user.fullName.charAt(0).toUpperCase();
      } else if (user.role === 'student' && user.firstName) {
        return user.firstName.charAt(0).toUpperCase();
      }
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDashboardLink = () => {
    console.log("User in getDashboardLink:", user);
    if (user && user.isAdmin) {
      console.log("User is admin, redirecting to admin dashboard");
      return '/admin/dashboard';
    }
    if (user && user.role === 'faculty') {
      console.log("User is faculty, redirecting to faculty dashboard");
      return '/faculty/dashboard';
    }
    console.log("Default dashboard - notices");
    return '/notices';
  };

  const menuItems = (
    <>
      <MenuItem 
        component={RouterLink} 
        to="/notices" 
        onClick={handleClose}
        sx={{ 
          '&:hover': { backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.08)' : 'transparent' },
        }}
      >
        Notices
      </MenuItem>
      <MenuItem 
        component={RouterLink} 
        to="/events" 
        onClick={handleClose}
        sx={{ 
          '&:hover': { backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.08)' : 'transparent' },
        }}
      >
        Events
      </MenuItem>
      {isAuthenticated && (
        <MenuItem 
          component={RouterLink} 
          to={getDashboardLink()} 
          onClick={handleClose}
          sx={{ 
            '&:hover': { backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.08)' : 'transparent' },
          }}
        >
          Dashboard
        </MenuItem>
      )}
    </>
  );

  // Desktop navigation items with better styling
  const desktopNavItems = (
    <>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/notices"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Notices
      </Button>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/events"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Events
      </Button>
      {isAuthenticated && (
        <Button 
          color="inherit" 
          component={RouterLink} 
          to={getDashboardLink()}
          sx={{ mx: 1, fontWeight: 500 }}
        >
          Dashboard
        </Button>
      )}
    </>
  );

  return (
    <AppBar 
      position="fixed"
      elevation={4}
      sx={{ 
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          CUSAT Notice Board
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {menuItems}
              {isAuthenticated ? (
                <>
                  <MenuItem 
                    component={RouterLink} 
                    to="/change-password" 
                    onClick={handleClose}
                  >
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); handleLogoutClick(); }}>
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={RouterLink} to="/login" onClick={handleClose}>
                    Login
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/register" onClick={handleClose}>
                    Register
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', mr: 2 }}>
              {desktopNavItems}
            </Box>
            {isAuthenticated ? (
              <>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleUserMenu}
                  color="inherit"
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                    {getUserInitial()}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={userMenuAnchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem disabled>
                    {user?.role === 'faculty' ? user?.fullName : `${user?.firstName} ${user?.lastName}`}
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    component={RouterLink} 
                    to="/change-password"
                    onClick={handleUserMenuClose}
                  >
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={handleLogoutClick}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    ml: 1,
                    fontWeight: 500,
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    ml: 1,
                    fontWeight: 500,
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </>
        )}
      </Toolbar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar; 