import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    Tooltip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH } from '../constants';
import ProfileModal from './ProfileModal';
import {updateUser} from "../api.js";

class LayoutErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        Something went wrong in the layout.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Please try refreshing the page or contact support.
                    </Typography>
                </Box>
            );
        }
        return this.props.children;
    }
}

const Layout = ({ children, drawerItems }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, loading, error } = useUser();
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user.name || '');

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setIsDrawerOpen(mobile ? false : true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setEditedName(user.name || 'Unknown');
    }, [user.name]);

    const handleMenuOpen = useCallback((event) => setAnchorEl(event.currentTarget), []);
    const handleMenuClose = useCallback(() => setAnchorEl(null), []);
    const handleSignOut = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/signin');
        handleMenuClose();
    }, [navigate, handleMenuClose]);
    const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
    const handleProfileClick = useCallback(() => {
        setProfileOpen(true);
        handleMenuClose();
    }, [handleMenuClose]);
    const handleProfileClose = useCallback(() => {
        setProfileOpen(false);
        setIsEditingName(false);
    }, []);
    const handleEditName = useCallback(() => {
        setEditedName(user.name || 'Unknown');
        setIsEditingName(true);
    }, [user.name]);
    const handleSaveName = async () => {
        if (editedName.trim() === '') {
            return 'Name cannot be empty';
        }
        try {
            // Assuming updateUser is imported from '../api'
            await updateUser({ name: editedName });
            // fetchCurrentUser will be called by UserContext
            setIsEditingName(false);
            return null;
        } catch (error) {
            console.error('Failed to update name:', error);
            return 'Failed to update name';
        }
    };

    return (
        <LayoutErrorBoundary>
            <Box className="flex min-h-screen transition-all" sx={{ bgcolor: theme.palette.background.default }}>
                <AppBar
                    position="fixed"
                    sx={{
                        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#ffffff',
                        color: theme.palette.text.primary,
                        boxShadow: 2,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar className="flex justify-between px-4 sm:px-6">
                        <Box className="flex items-center">
                            <Tooltip title={isDrawerOpen ? 'Collapse Drawer' : 'Expand Drawer'} arrow>
                                <IconButton
                                    aria-label={isDrawerOpen ? 'Collapse navigation drawer' : 'Expand navigation drawer'}
                                    onClick={toggleDrawer}
                                    sx={{ color: 'inherit', mr: { xs: 1, sm: 2 } }}
                                >
                                    {isDrawerOpen ? <ChevronLeft /> : <MenuIcon />}
                                </IconButton>
                            </Tooltip>
                            <Typography
                                component={Link}
                                to="/"
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                }}
                                aria-label="Go to Study Plan Scheduler homepage"
                            >
                                Study Plan Scheduler
                            </Typography>
                        </Box>
                        <Box className="flex items-center">
                            {loading ? (
                                <CircularProgress size={24} aria-label="Loading user data" />
                            ) : error ? (
                                <Alert severity="error" sx={{ fontSize: '0.875rem', py: 0.5 }}>
                                    {error}
                                </Alert>
                            ) : (
                                <Tooltip title="User Menu" arrow>
                                    <IconButton
                                        aria-label="Open user menu"
                                        onClick={handleMenuOpen}
                                        sx={{ ml: 1 }}
                                    >
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                                            {user.initial}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: {
                                        bgcolor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                                        color: theme.palette.text.primary,
                                        borderRadius: 2,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    },
                                }}
                            >
                                <MenuItem onClick={handleProfileClick} sx={{ fontSize: '0.9rem', py: 1 }}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleSignOut} sx={{ fontSize: '0.9rem', py: 1 }}>
                                    Sign Out
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                            color: theme.palette.text.primary,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            transition: 'width 0.3s ease-in-out',
                        },
                    }}
                    aria-label="Navigation drawer"
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            {drawerItems.map((item) => (
                                <Tooltip key={item.text} title={isDrawerOpen ? '' : item.text} placement="right" arrow>
                                    <ListItem
                                        button
                                        component={Link}
                                        to={item.path}
                                        onClick={() => isMobile && setIsDrawerOpen(false)}
                                        sx={{
                                            justifyContent: isDrawerOpen ? 'initial' : 'center',
                                            px: 2.5,
                                            py: 1,
                                            borderRadius: 2,
                                            mx: 1,
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0',
                                            },
                                            '&.Mui-selected': {
                                                bgcolor: theme.palette.primary.light,
                                                color: theme.palette.primary.contrastText,
                                                '& .MuiListItemIcon-root': {
                                                    color: theme.palette.primary.contrastText,
                                                },
                                            },
                                        }}
                                        selected={window.location.pathname === item.path}
                                        aria-label={item.ariaLabel}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: isDrawerOpen ? 3 : 'auto',
                                                color:
                                                    window.location.pathname === item.path
                                                        ? theme.palette.primary.contrastText
                                                        : theme.palette.text.primary,
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                                        />
                                    </ListItem>
                                </Tooltip>
                            ))}
                        </List>
                        <Divider sx={{ bgcolor: theme.palette.divider }} />
                    </Box>
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        ml: isMobile ? 0 : isDrawerOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_DRAWER_WIDTH}px`,
                        bgcolor: theme.palette.background.default,
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        transition: 'margin-left 0.3s ease-in-out',
                    }}
                    aria-label="Main content"
                >
                    <Toolbar />
                    <Box sx={{ maxWidth: '1200px', width: '100%' }}>{children}</Box>
                </Box>

                <ProfileModal
                    open={profileOpen}
                    onClose={handleProfileClose}
                    user={user}
                    loading={loading}
                    error={error}
                    isEditingName={isEditingName}
                    editedName={editedName}
                    setIsEditingName={setIsEditingName}
                    setEditedName={setEditedName}
                    handleEditName={handleEditName}
                    handleSaveName={handleSaveName}
                    theme={theme}
                />
            </Box>
        </LayoutErrorBoundary>
    );
};

export default Layout;
