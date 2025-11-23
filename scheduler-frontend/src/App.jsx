import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import Settings from './pages/Settings';
import Callback from './pages/Callback';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProviderWrapper } from './context/ThemeContext';

// Create a QueryClient instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const PlaceholderPage = ({ title }) => (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1">This page is under construction.</Typography>
    </Box>
);

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        Something went wrong.
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

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();
    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
    if (!user.id) return <Navigate to="/signin" replace />;
    return children;
};

const App = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <ThemeProviderWrapper>
                        <UserProvider>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/signin" element={<SignIn />} />
                                <Route path="/signup" element={<SignUp />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route
                                    path="/home"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/schedules"
                                    element={
                                        <ProtectedRoute>
                                            <Schedules />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/schedules/:id"
                                    element={
                                        <ProtectedRoute>
                                            <PlaceholderPage title="Schedule Details" />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/tasks"
                                    element={
                                        <ProtectedRoute>
                                            <PlaceholderPage title="Tasks" />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/courses"
                                    element={
                                        <ProtectedRoute>
                                            <PlaceholderPage title="Courses" />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <ProtectedRoute>
                                            <Settings />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/callback" element={<Callback />} />
                            </Routes>
                        </UserProvider>
                    </ThemeProviderWrapper>
                </QueryClientProvider>
            </ErrorBoundary>
        </Router>
    );
};

export default App;