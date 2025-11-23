import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Fade,
    Slide,
    Alert,
    useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Schedule, School, CalendarToday } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import { signup } from '../api';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const { themeMode } = React.useContext(ThemeContext);
    const theme = useTheme();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const onSubmit = async (data) => {
        setSuccess('');
        setError('');
        setLoading(true);
        try {
            await signup({ name: data.name, email: data.email, password: data.password });
            setSuccess('Account created successfully! Redirecting to sign-in...');
            reset();
            setTimeout(() => navigate('/signin'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const MotionCard = motion(Card);

    return (
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: themeMode === 'light' ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)' : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                    color: theme.palette.common.white,
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Fade in timeout={1000}>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
                            aria-label="Study Plan Scheduler"
                        >
                            Study Plan Scheduler
                        </Typography>
                    </Fade>
                    <Slide direction="up" in timeout={1200}>
                        <Typography
                            variant="h6"
                            sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' }, maxWidth: '600px', mx: 'auto' }}
                        >
                            Automate your study schedule with seamless Google Classroom and Calendar integration.
                        </Typography>
                    </Slide>
                    <Button
                        variant="contained"
                        onClick={scrollToForm}
                        sx={{
                            bgcolor: theme.palette.common.white,
                            color: theme.palette.primary.main,
                            fontSize: '0.875rem',
                            py: 1,
                            px: 3,
                            borderRadius: 2,
                            '&:hover': { bgcolor: theme.palette.grey[200], transform: 'scale(1.05)' },
                            transition: 'transform 0.2s, background-color 0.2s',
                        }}
                        aria-label="Get started with Study Plan Scheduler"
                    >
                        Get Started
                    </Button>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        sx={{ textAlign: 'center', fontWeight: 700, mb: 6, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        aria-label="Why Choose Study Plan Scheduler"
                    >
                        Why Choose Study Plan Scheduler?
                    </Typography>
                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <Schedule sx={{ color: theme.palette.primary.main, fontSize: 40, mb: 2 }} />,
                                title: 'Smart Automation',
                                description: 'Input your courses and preferences, and our system creates a tailored study plan, adjustable manually.',
                            },
                            {
                                icon: <School sx={{ color: theme.palette.primary.main, fontSize: 40, mb: 2 }} />,
                                title: 'Google Classroom Sync',
                                description: 'Automatically imports tasks and assignments from Google Classroom to keep your plan up-to-date.',
                            },
                            {
                                icon: <CalendarToday sx={{ color: theme.palette.primary.main, fontSize: 40, mb: 2 }} />,
                                title: 'Calendar Integration',
                                description: 'Syncs study sessions and deadlines to Google Calendar for seamless event management.',
                            },
                        ].map((feature, index) => (
                            <Grid item xs={12} sm={4} key={index}>
                                <MotionCard
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[3],
                                        bgcolor: theme.palette.background.default,
                                        '&:hover': { boxShadow: theme.shadows[6], transform: 'translateY(-4px)' },
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <CardContent>
                                        {feature.icon}
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* How It Works Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.default }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        sx={{ textAlign: 'center', fontWeight: 700, mb: 6, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        aria-label="How It Works"
                    >
                        How It Works
                    </Typography>
                    <Grid container spacing={4}>
                        {[
                            {
                                title: '1. Input Preferences',
                                description: 'Enter your courses, study hours, and priorities to customize your plan.',
                            },
                            {
                                title: '2. Sync with Google',
                                description: 'Connect to Google Classroom to import tasks and Google Calendar to schedule events.',
                            },
                            {
                                title: '3. Study Smarter',
                                description: 'Follow your automated plan, adjust manually, and stay on track with reminders.',
                            },
                        ].map((step, index) => (
                            <Grid item xs={12} sm={4} key={index}>
                                <MotionCard
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[3],
                                        bgcolor: theme.palette.background.default,
                                        '&:hover': { boxShadow: theme.shadows[6], transform: 'translateY(-4px)' },
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <CardContent>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            {step.description}
                                        </Typography>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Sign-Up Form Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }} ref={formRef}>
                <Container maxWidth="sm">
                    <Typography
                        variant="h4"
                        sx={{ textAlign: 'center', fontWeight: 700, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        aria-label="Get Started Today"
                    >
                        Get Started Today
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ textAlign: 'center', color: theme.palette.text.secondary, mb: 4, maxWidth: '500px', mx: 'auto' }}
                    >
                        Sign up to experience smarter study planning with automated scheduling.
                    </Typography>
                    <Fade in={!!success || !!error} timeout={500}>
                        <Box>
                            {(success || error) && (
                                <Alert
                                    severity={success ? 'success' : 'error'}
                                    sx={{ mb: 2, borderRadius: 2 }}
                                    aria-live="assertive"
                                >
                                    {success || error}
                                </Alert>
                            )}
                        </Box>
                    </Fade>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: '400px', mx: 'auto' }}>
                        <TextField
                            fullWidth
                            label="Name"
                            margin="normal"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', py: 0.5 } }}
                            {...register('name', { required: 'Name is required' })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            inputProps={{ 'aria-label': 'Enter your name', 'aria-required': true }}
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', py: 0.5 } }}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Invalid email address',
                                },
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            inputProps={{ 'aria-label': 'Enter your email address', 'aria-required': true }}
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', py: 0.5 } }}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            inputProps={{ 'aria-label': 'Enter your password', 'aria-required': true }}
                            disabled={loading}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    py: 1,
                                    fontSize: '0.875rem',
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'scale(1.02)' },
                                    transition: 'transform 0.2s, background-color 0.2s',
                                }}
                                disabled={loading}
                                aria-label="Sign up for free"
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up for Free'}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => reset()}
                                sx={{
                                    py: 1,
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.primary,
                                    borderColor: theme.palette.divider,
                                    '&:hover': { bgcolor: theme.palette.grey[100] },
                                }}
                                disabled={loading}
                                aria-label="Reset form"
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: theme.palette.text.secondary }}>
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                            aria-label="Sign in to your account"
                        >
                            Sign In
                        </Link>
                    </Typography>
                </Container>
            </Box>

            {/* Sticky CTA Banner */}
            <Slide direction="up" in timeout={500}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        borderRadius: 2,
                        p: 2,
                        boxShadow: theme.shadows[6],
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 2,
                        zIndex: 1000,
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Ready to study smarter?
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={scrollToForm}
                        sx={{
                            bgcolor: theme.palette.common.white,
                            color: theme.palette.primary.main,
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 2,
                            '&:hover': { bgcolor: theme.palette.grey[200] },
                        }}
                        aria-label="Sign up now"
                    >
                        Sign Up Now
                    </Button>
                </Box>
            </Slide>

            {/* Footer */}
            <Box sx={{ bgcolor: theme.palette.grey[900], color: theme.palette.common.white, py: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Study Plan Scheduler
                            </Typography>
                            <Typography variant="body2">
                                Automate your study success with our intelligent scheduling system.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Links
                            </Typography>
                            <Typography variant="body2" component="div">
                                <Link
                                    to="/signin"
                                    style={{ display: 'block', color: theme.palette.common.white, textDecoration: 'none' }}
                                    sx={{ '&:hover': { textDecoration: 'underline' } }}
                                    aria-label="Sign in page"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    style={{ display: 'block', color: theme.palette.common.white, textDecoration: 'none' }}
                                    sx={{ '&:hover': { textDecoration: 'underline' } }}
                                    aria-label="Sign up page"
                                >
                                    Sign Up
                                </Link>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Contact
                            </Typography>
                            <Typography variant="body2">
                                Email: support@studyplanscheduler.com
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;