import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Fade, Slide, Tooltip } from '@mui/material';
import { Home } from '@mui/icons-material';
import AuthForm from '../components/AuthForm';
import ErrorMessage from '../components/ErrorMessage';
import { resetPassword } from '../api';

const HOME_LINK = (
    <Tooltip title="Return to the home page" arrow>
        <Typography
            variant="body2"
            sx={{
                mt: 2,
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
            <Home sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Back to Home
        </Typography>
    </Tooltip>
);

const ResetPassword = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleResetPassword = async ({ newPassword }) => {
        setError('');
        setLoading(true);
        try {
            await resetPassword({ token, newPassword });
            setError('Password reset successful! Redirecting to sign-in...');
            setTimeout(() => navigate('/signin'), 3000);
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
                    setError('Invalid or expired token.');
                    break;
                case 429:
                    setError('Too many attempts. Please try again later.');
                    break;
                case 500:
                    setError('Something went wrong. Please try again.');
                    break;
                default:
                    setError(err.message || 'An error occurred.');
            }
        } else {
            setError('Network error. Please check your connection.');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Fade in timeout={500}>
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
                        Reset Password
                    </Typography>
                    <ErrorMessage message={error} />
                    <AuthForm type="reset" onSubmit={handleResetPassword} disabled={loading || !token} />
                    {loading && <CircularProgress sx={{ mt: 2 }} />}
                    <Slide direction="up" in={!loading} timeout={300}>
                        {HOME_LINK}
                    </Slide>
                </Box>
            </Fade>
        </Container>
    );
};

export default ResetPassword;