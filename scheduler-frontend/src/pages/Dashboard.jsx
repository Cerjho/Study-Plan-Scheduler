import React, { useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from './Layout';
import CourseSection from './CourseSection';
import GoalSection from './GoalSection';
import { useUser } from '../context/UserContext';
import { getCoursesByUser, getGoalsByUser, getTasksByUser } from '../api';
import { DRAWER_ITEMS } from '../constants';

const Dashboard = () => {
    const theme = useTheme();
    const { user, loading: userLoading, error: userError } = useUser();
    const queryClient = useQueryClient();

    const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useQuery({
        queryKey: ['courses', user.id],
        queryFn: () => getCoursesByUser(user.id).then((res) => res.data),
        enabled: !!user.id,
        retry: 2,
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useQuery({
        queryKey: ['goals', user.id],
        queryFn: () => getGoalsByUser(user.id).then((res) => res.data),
        enabled: !!user.id,
        retry: 2,
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
        queryKey: ['tasks', user.id],
        queryFn: () => getTasksByUser(user.id).then((res) => res.data),
        enabled: !!user.id,
        retry: 2,
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const loading = userLoading || coursesLoading || goalsLoading || tasksLoading;
    const error = userError || coursesError || goalsError || tasksError;

    const fetchData = () => {
        queryClient.invalidateQueries(['courses', user.id]);
        queryClient.invalidateQueries(['goals', user.id]);
        queryClient.invalidateQueries(['tasks', user.id]);
    };

    useEffect(() => {
        if (!user.id && !userLoading) {
            // Handled by ProtectedRoute in App.jsx
        }
    }, [user.id, userLoading]);

    return (
        <Layout drawerItems={DRAWER_ITEMS}>
            <Box sx={{ maxWidth: '1000px', width: '100%' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} role="alert">
                        {error.message ||
                            (coursesError
                                ? 'Failed to load courses'
                                : goalsError
                                    ? 'Failed to load goals'
                                    : tasksError
                                        ? 'Failed to load tasks'
                                        : 'Failed to load dashboard data')}
                        <Button
                            variant="text"
                            color="primary"
                            onClick={fetchData}
                            sx={{ ml: 1 }}
                            aria-label="Retry loading dashboard data"
                        >
                            Retry
                        </Button>
                    </Alert>
                )}
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        mb: 4,
                        color: theme.palette.text.primary,
                        textAlign: 'center',
                    }}
                    aria-label={`Welcome message for ${user.name}`}
                >
                    Welcome to Your Dashboard, {user.name}!
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress aria-label="Loading dashboard data" />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <CourseSection
                                courses={courses}
                                tasks={tasks}
                                fetchCourses={fetchData}
                                fetchTasks={fetchData}
                                userId={user.id}
                                theme={theme}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <GoalSection
                                goals={goals}
                                fetchGoals={fetchData}
                                userId={user.id}
                                theme={theme}
                            />
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Layout>
    );
};

export default Dashboard;