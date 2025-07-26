import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip,
  Alert,
  Collapse
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user, serverError, testServerConnection } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking');
  const [showServerAlert, setShowServerAlert] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check server status periodically
  useEffect(() => {
    const checkServer = async () => {
      if (testServerConnection) {
        const isOnline = await testServerConnection();
        setServerStatus(isOnline ? 'online' : 'offline');
        setShowServerAlert(!isOnline);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [testServerConnection]);

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online': return 'success';
      case 'offline': return 'error';
      default: return 'warning';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      default: return 'Checking...';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fee Management System
          </Typography>
          
          {/* Server Status Indicator */}
          <Chip
            label={getServerStatusText()}
            color={getServerStatusColor()}
            size="small"
            sx={{ mr: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/all-students"
            >
              All Students
            </Button>
            {isAuthenticated ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/profile"
                >
                  Profile
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout ({user?.name})
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Server Offline Alert */}
      <Collapse in={showServerAlert}>
        <Alert 
          severity="error" 
          onClose={() => setShowServerAlert(false)}
        >
          Cannot connect to the server. Please make sure the backend is running on http://localhost:8000
        </Alert>
      </Collapse>
    </>
  );
};

export default Navbar;