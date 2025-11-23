import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Fade,
    Slide,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import { Home, PersonAdd } from '@mui/icons-material';
import AuthForm from '../components/AuthForm';
import GoogleButton from '../components/GoogleButton.jsx';
import ErrorMessage from '../components/ErrorMessage';
import { login, initiatePasswordReset } from '../api';

const HOME_LINK = (
    <Typography
        variant="body2"
        sx={{
            mt: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a73e8',
            '&:hover': { color: '#1557b0', textDecoration: 'underline' },
        }}
        component="a"
        href="/"
        aria-label="Back to home page"
    >
        <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
        Back to Home
    </Typography>
);

const SignIn = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogEmail, setDialogEmail] = useState('');
    const [dialogError, setDialogError] = useState('');
    const [dialogSuccess, setDialogSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
        }
    }, [location]);

    const handleSignin = async ({ email, password }) => {
        setError('');
        setLoading(true);
        try {
            const response = await login({ email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/home', { replace: true });
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        setDialogOpen(true);
        setDialogEmail('');
        setDialogError('');
        setDialogSuccess('');
    };

    const handleDialogSubmit = async () => {
        if (!dialogEmail) {
            setDialogError('Email is required');
            return;
        }
        setLoading(true);
        try {
            await initiatePasswordReset({ email: dialogEmail });
            setDialogSuccess('Password reset link sent! Check your email.');
            setDialogError('');
            setTimeout(() => setDialogOpen(false), 3000);
        } catch (err) {
            setDialogError(err.message || 'Failed to send reset link. Try again.');
            setDialogSuccess('');
        } finally {
            setLoading(false);
        }
    };

    const handleError = (err) => {
        if (err.response) {
            switch (err.response.status) {
                case 400:
                case 401:
                    setError('Invalid email or password.');
                    break;
                case 429:
                    setError('Too many attempts. Try again later.');
                    break;
                case 500:
                    setError('Something went wrong. Try again.');
                    break;
                default:
                    setError(err.response.data.message || 'An error occurred.');
            }
        } else {
            setError('Network error. Check your connection.');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Fade in timeout={500}>
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, fontSize: '1.5rem' }}>
                        Sign In
                    </Typography>
                    <ErrorMessage message={error} />
                    <AuthForm type="signin" onSubmit={handleSignin} onForgotPassword={handleForgotPassword} disabled={loading} />
                    <Typography variant="body2" sx={{ my: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                        or
                    </Typography>
                    <GoogleButton disabled={loading} />
                    {loading && <CircularProgress size={20} sx={{ mt: 1.5 }} />}
                    <Box
                        sx={{
                            mt: 1.5,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                        }}
                    >
                        Don’t have an account?
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{
                                color: '#1a73e8',
                                '&:hover': { color: '#1557b0', textDecoration: 'underline' },
                            }}
                        >
                            <a href="/signup" aria-label="Create a new account">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PersonAdd sx={{ fontSize: '1rem' }} />
                                    Sign Up
                                </Box>
                            </a>
                        </Typography>
                    </Box>
                    <Slide direction="up" in={!loading} timeout={300}>
                        {HOME_LINK}
                    </Slide>
                </Box>
            </Fade>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth aria-labelledby="forgot-password-dialog-title">
                <DialogTitle id="forgot-password-dialog-title">Forgot Password</DialogTitle>
                <DialogContent>
                    {(dialogError || dialogSuccess) && (
                        <ErrorMessage message={dialogError || dialogSuccess} />
                    )}
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={dialogEmail}
                        onChange={(e) => setDialogEmail(e.target.value)}
                        margin="normal"
                        size="small"
                        disabled={loading}
                        error={!!dialogError && !dialogEmail}
                        helperText={dialogError && !dialogEmail ? 'Email is required' : ''}
                        aria-label="Email for password reset"
                        inputProps={{ 'aria-required': true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={loading} aria-label="Cancel password reset">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        aria-label="Send password reset link"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SignIn;