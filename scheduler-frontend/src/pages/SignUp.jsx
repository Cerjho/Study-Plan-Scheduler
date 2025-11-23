import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Fade, Slide } from '@mui/material';
import { Home, Login } from '@mui/icons-material';
import AuthForm from '../components/AuthForm';
import GoogleButton from '../components/GoogleButton';
import ErrorMessage from '../components/ErrorMessage';
import { signup } from '../api';

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

const SignUp = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async ({ name, email, password }) => {
        setError('');
        setLoading(true);
        try {
            const response = await signup({ name, email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/signin', { replace: true });
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (err) => {
        if (err.response) {
            switch (err.response.status) {
                case 400:
                    setError('Invalid input. Please check your details.');
                    break;
                case 409:
                    setError('Email already exists.');
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
                        Sign Up
                    </Typography>
                    <ErrorMessage message={error} />
                    <AuthForm type="signup" onSubmit={handleSignup} disabled={loading} />
                    <Typography variant="body2" sx={{ my: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                        or
                    </Typography>
                    <GoogleButton disabled={loading} />
                    {loading && <CircularProgress size={20} sx={{ mt: 1.5 }} />}
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                        Already have an account?
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{
                                color: '#1a73e8',
                                '&:hover': { color: '#1557b0', textDecoration: 'underline' },
                            }}
                        >
                            <a href="/signin" aria-label="Sign in to your account">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Login sx={{ fontSize: '1rem' }} />
                                    Sign In
                                </Box>
                            </a>
                        </Typography>
                    </Box>
                    <Slide direction="up" in={!loading} timeout={300}>
                        {HOME_LINK}
                    </Slide>
                </Box>
            </Fade>
        </Container>
    );
};

export default SignUp;