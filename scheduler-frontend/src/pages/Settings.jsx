import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fade,
    Slide,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatISO, parse, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import Layout from './Layout';
import { useUser } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    getStudyPreferences,
    getUnavailabilitiesByUser,
    createStudyPreference,
    updateStudyPreference,
    deleteStudyPreference,
    createUnavailability,
    updateUnavailability,
    deleteUnavailability,
    updateUser,
} from '../api';
import { DRAWER_ITEMS } from '../constants';

// Preference Modal Component
const PreferenceModal = React.memo(
    ({
         open,
         onClose,
         preference,
         preferenceId,
         userId,
         onSave,
         onError,
         onSuccess,
         isLoading,
         error,
         existingPreferences = [],
     }) => {
        const [newPreference, setNewPreference] = useState({
            day: preference?.day || '',
            startTime: preference?.startTime || '',
            endTime: preference?.endTime || '',
            preferredSlotDuration: preference?.preferredSlotDuration || 60,
            productivityScore: preference?.productivityScore || 1.0,
        });
        const [localError, setLocalError] = useState(null);

        const validatePreference = useCallback(() => {
            if (!newPreference.day) return 'Day is required';
            if (!newPreference.startTime || !newPreference.endTime)
                return 'Start and end times are required';
            try {
                const normalizeTime = (time) => {
                    if (!time) return null;
                    const parts = time.split(':');
                    const hours = parseInt(parts[0], 10);
                    const minutes = parseInt(parts[1], 10);
                    if (isNaN(hours) || isNaN(minutes)) return null;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                };
                const startTime = normalizeTime(newPreference.startTime);
                const endTime = normalizeTime(newPreference.endTime);
                if (!startTime || !endTime) return 'Invalid time format';
                const start = parse(startTime, 'HH:mm', new Date());
                const end = parse(endTime, 'HH:mm', new Date());
                if (!isValid(start) || !isValid(end)) {
                    console.error('Time parsing failed:', { startTime, endTime });
                    return 'Invalid time format';
                }
                if (end <= start) return 'End time must be after start time';
                if (!Number.isInteger(Number(newPreference.preferredSlotDuration)) || newPreference.preferredSlotDuration <= 0)
                    return 'Preferred slot duration must be a positive integer';
                if (
                    newPreference.productivityScore < 0 ||
                    newPreference.productivityScore > 1 ||
                    isNaN(newPreference.productivityScore)
                )
                    return 'Productivity score must be between 0 and 1';
                if (
                    existingPreferences.some(
                        (p) => p.day === newPreference.day && p.id !== preferenceId
                    )
                ) {
                    return `A preference for ${newPreference.day} already exists`;
                }
                return null;
            } catch (error) {
                console.error('Validation error:', error);
                return 'Invalid time format';
            }
        }, [newPreference, existingPreferences, preferenceId]);

        const handleSave = useCallback(() => {
            const validationError = validatePreference();
            if (validationError) {
                setLocalError(validationError);
                onError(validationError);
                return;
            }
            const preferenceData = {
                day: newPreference.day,
                startTime: newPreference.startTime.slice(0, 5),
                endTime: newPreference.endTime.slice(0, 5),
                userId,
                preferredSlotDuration: parseInt(newPreference.preferredSlotDuration, 10),
                productivityScore: parseFloat(newPreference.productivityScore),
            };
            console.log('Saving preference:', preferenceData);
            onSave(preferenceId ? { id: preferenceId, data: preferenceData } : preferenceData);
        }, [newPreference, userId, preferenceId, validatePreference, onSave, onError]);

        const handleReset = useCallback(() => {
            setNewPreference({
                day: preference?.day || '',
                startTime: preference?.startTime || '',
                endTime: preference?.endTime || '',
                preferredSlotDuration: preference?.preferredSlotDuration || 60,
                productivityScore: preference?.productivityScore || 1.0,
            });
            setLocalError(null);
        }, [preference]);

        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                aria-labelledby="preference-dialog-title"
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' }}
            >
                <DialogTitle id="preference-dialog-title">
                    {preferenceId ? 'Edit Preference' : 'Add Preference'}
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Fade in={!!localError || !!error} timeout={500}>
                        <Box>
                            {(localError || error) && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 2, borderRadius: 2 }}
                                    aria-live="assertive"
                                >
                                    {localError || error}
                                </Alert>
                            )}
                        </Box>
                    </Fade>
                    <TextField
                        select
                        label="Day"
                        value={newPreference.day}
                        onChange={(e) =>
                            setNewPreference({ ...newPreference, day: e.target.value })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!localError && !newPreference.day}
                        helperText={
                            localError && !newPreference.day ? 'Day is required' : ''
                        }
                        aria-label="Select day for study preference"
                        inputProps={{ 'aria-required': true }}
                    >
                        {[
                            'MONDAY',
                            'TUESDAY',
                            'WEDNESDAY',
                            'THURSDAY',
                            'FRIDAY',
                            'SATURDAY',
                            'SUNDAY',
                        ].map((day) => (
                            <MenuItem
                                key={day}
                                value={day}
                                disabled={
                                    existingPreferences.some(
                                        (p) => p.day === day && p.id !== preferenceId
                                    )
                                }
                            >
                                {day.charAt(0) + day.slice(1).toLowerCase()}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Start Time"
                        type="time"
                        value={newPreference.startTime}
                        onChange={(e) =>
                            setNewPreference({
                                ...newPreference,
                                startTime: e.target.value,
                            })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!localError && !newPreference.startTime}
                        helperText={
                            localError && !newPreference.startTime
                                ? 'Start time is required'
                                : ''
                        }
                        aria-label="Start time for study preference"
                        inputProps={{ 'aria-required': true }}
                    />
                    <TextField
                        label="End Time"
                        type="time"
                        value={newPreference.endTime}
                        onChange={(e) =>
                            setNewPreference({
                                ...newPreference,
                                endTime: e.target.value,
                            })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!localError && !newPreference.endTime}
                        helperText={
                            localError && !newPreference.endTime
                                ? 'End time is required'
                                : ''
                        }
                        aria-label="End time for study preference"
                        inputProps={{ 'aria-required': true }}
                    />
                    <TextField
                        label="Preferred Slot Duration (minutes)"
                        type="number"
                        value={newPreference.preferredSlotDuration}
                        onChange={(e) =>
                            setNewPreference({
                                ...newPreference,
                                preferredSlotDuration: e.target.value,
                            })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={
                            !!localError &&
                            (!Number.isInteger(Number(newPreference.preferredSlotDuration)) ||
                                newPreference.preferredSlotDuration <= 0)
                        }
                        helperText={
                            localError &&
                            (!Number.isInteger(Number(newPreference.preferredSlotDuration)) ||
                                newPreference.preferredSlotDuration <= 0)
                                ? 'Must be a positive integer'
                                : ''
                        }
                        aria-label="Preferred slot duration in minutes"
                        inputProps={{ min: 1, step: 1, 'aria-required': true }}
                    />
                    <TextField
                        label="Productivity Score (0.0 to 1.0)"
                        type="number"
                        value={newPreference.productivityScore}
                        onChange={(e) =>
                            setNewPreference({
                                ...newPreference,
                                productivityScore: e.target.value,
                            })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={
                            !!localError &&
                            (newPreference.productivityScore < 0 ||
                                newPreference.productivityScore > 1 ||
                                isNaN(newPreference.productivityScore))
                        }
                        helperText={
                            localError &&
                            (newPreference.productivityScore < 0 ||
                                newPreference.productivityScore > 1 ||
                                isNaN(newPreference.productivityScore))
                                ? 'Must be between 0 and 1'
                                : ''
                        }
                        aria-label="Productivity score for study preference"
                        inputProps={{ min: 0, max: 1, step: 0.1, 'aria-required': true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleReset}
                        disabled={isLoading}
                        sx={{ borderRadius: 2 }}
                        aria-label="Reset preference form"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={onClose}
                        disabled={isLoading}
                        sx={{ borderRadius: 2 }}
                        aria-label="Cancel preference changes"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{ borderRadius: 2, px: 3 }}
                        aria-label="Save study preference"
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);

const Settings = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading, error: userError } = useUser();
    const { themeMode, updateTheme } = React.useContext(ThemeContext);
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [notifications, setNotifications] = useState({
        email: localStorage.getItem('emailNotifications') === 'true',
        push: localStorage.getItem('pushNotifications') === 'true',
    });
    const [selectedPreferenceId, setSelectedPreferenceId] = useState(null);
    const [preferenceModalOpen, setPreferenceModalOpen] = useState(false);
    const [selectedPreference, setSelectedPreference] = useState(null);
    const [newUnavailability, setNewUnavailability] = useState({
        startTime: '',
        endTime: '',
        description: '',
    });
    const [selectedUnavailabilityId, setSelectedUnavailabilityId] = useState(null);
    const [unavailabilityModalOpen, setUnavailabilityModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const { data: preferences = [], isLoading: preferencesLoading, error: preferencesError } = useQuery({
        queryKey: ['preferences'],
        queryFn: () => getStudyPreferences().then((res) => res.data || []),
        enabled: !!user.id,
        retry: 2,
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const { data: unavailabilities = [], isLoading: unavailabilitiesLoading, error: unavailabilitiesError } = useQuery({
        queryKey: ['unavailabilities', user.id],
        queryFn: () => getUnavailabilitiesByUser(user.id).then((res) => res.data || []),
        enabled: !!user.id,
        retry: 2,
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const loading = userLoading || preferencesLoading || unavailabilitiesLoading;
    const apiError = userError || preferencesError || unavailabilitiesError;

    useEffect(() => {
        if (!user.id && !userLoading) {
            navigate('/signin');
        }
    }, [user.id, userLoading, navigate]);

    const handleThemeChange = useCallback(() => {
        updateTheme(themeMode === 'light' ? 'dark' : 'light');
    }, [themeMode, updateTheme]);

    const handleNotificationChange = useCallback((type) => {
        setNotifications((prev) => {
            const updated = { ...prev, [type]: !prev[type] };
            localStorage.setItem(`${type}Notifications`, updated[type].toString());
            return updated;
        });
    }, []);

    const createPreferenceMutation = useMutation({
        mutationFn: (data) => createStudyPreference(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] });
            setSuccess('Preference created successfully');
            setPreferenceModalOpen(false);
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to create study preference');
        },
    });

    const updatePreferenceMutation = useMutation({
        mutationFn: ({ id, data }) => updateStudyPreference(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] });
            setSuccess('Preference updated successfully');
            setPreferenceModalOpen(false);
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to update study preference');
        },
    });

    const deletePreferenceMutation = useMutation({
        mutationFn: (id) => deleteStudyPreference(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] });
            setSuccess('Preference deleted successfully');
            setDeleteConfirmOpen(false);
            setSelectedPreferenceId(null);
            setDeleteType(null);
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to delete preference');
        },
    });

    const createUnavailabilityMutation = useMutation({
        mutationFn: (data) => createUnavailability(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unavailabilities', user.id] });
            setSuccess('Unavailability created successfully');
            handleUnavailabilityModalClose();
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to create unavailability');
        },
    });

    const updateUnavailabilityMutation = useMutation({
        mutationFn: ({ id, data }) => updateUnavailability(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unavailabilities', user.id] });
            setSuccess('Unavailability updated successfully');
            handleUnavailabilityModalClose();
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to update unavailability');
        },
    });

    const deleteUnavailabilityMutation = useMutation({
        mutationFn: (id) => deleteUnavailability(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unavailabilities', user.id] });
            setSuccess('Unavailability deleted successfully');
            setDeleteConfirmOpen(false);
            setSelectedUnavailabilityId(null);
            setDeleteType(null);
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to delete unavailability');
        },
    });

    const updateTimezoneMutation = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            setSuccess('Timezone updated successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.error || 'Failed to update timezone');
        },
    });

    const handlePreferenceModalOpen = useCallback((preference) => {
        setSelectedPreference(preference || null);
        setSelectedPreferenceId(preference?.id || null);
        setPreferenceModalOpen(true);
        setError(null);
        setSuccess(null);
    }, []);

    const handlePreferenceModalClose = useCallback(() => {
        setPreferenceModalOpen(false);
        setSelectedPreference(null);
        setSelectedPreferenceId(null);
        setError(null);
    }, []);

    const handlePreferenceSave = useCallback(
        (data) => {
            if (data.id) {
                updatePreferenceMutation.mutate(data);
            } else {
                createPreferenceMutation.mutate(data);
            }
        },
        [createPreferenceMutation, updatePreferenceMutation]
    );

    const handlePreferenceDelete = useCallback((id) => {
        setDeleteType('preference');
        setSelectedPreferenceId(id);
        setDeleteConfirmOpen(true);
    }, []);

    const validateUnavailability = useCallback(() => {
        if (!newUnavailability.startTime || !newUnavailability.endTime)
            return 'Start and end times are required';
        const start = new Date(newUnavailability.startTime);
        const end = new Date(newUnavailability.endTime);
        if (!isValid(start) || !isValid(end)) return 'Invalid date format';
        if (end <= start) return 'End time must be after start time';
        return null;
    }, [newUnavailability]);

    const handleUnavailabilityModalOpen = useCallback(
        (unavailability = { startTime: '', endTime: '', description: '' }) => {
            setNewUnavailability({
                startTime: unavailability.startTime || '',
                endTime: unavailability.endTime || '',
                description: unavailability.description || '',
            });
            setSelectedUnavailabilityId(unavailability.id || null);
            setUnavailabilityModalOpen(true);
            setError(null);
            setSuccess(null);
        },
        []
    );

    const handleUnavailabilityModalClose = useCallback(() => {
        setUnavailabilityModalOpen(false);
        setNewUnavailability({ startTime: '', endTime: '', description: '' });
        setSelectedUnavailabilityId(null);
        setError(null);
    }, []);

    const handleUnavailabilityReset = useCallback(() => {
        setNewUnavailability({ startTime: '', endTime: '', description: '' });
        setError(null);
    }, []);

    const handleUnavailabilitySave = useCallback(() => {
        const validationError = validateUnavailability();
        if (validationError) {
            setError(validationError);
            return;
        }
        const unavailabilityData = {
            ...newUnavailability,
            userId: user.id,
            startTime: formatISO(new Date(newUnavailability.startTime)),
            endTime: formatISO(new Date(newUnavailability.endTime)),
        };
        if (selectedUnavailabilityId) {
            updateUnavailabilityMutation.mutate({
                id: selectedUnavailabilityId,
                data: unavailabilityData,
            });
        } else {
            createUnavailabilityMutation.mutate(unavailabilityData);
        }
    }, [
        newUnavailability,
        user.id,
        selectedUnavailabilityId,
        validateUnavailability,
        createUnavailabilityMutation,
        updateUnavailabilityMutation,
    ]);

    const handleUnavailabilityDelete = useCallback((id) => {
        setDeleteType('unavailability');
        setSelectedUnavailabilityId(id);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (deleteType === 'preference') {
            deletePreferenceMutation.mutate(selectedPreferenceId);
        } else if (deleteType === 'unavailability') {
            deleteUnavailabilityMutation.mutate(selectedUnavailabilityId);
        }
    }, [deleteType, selectedPreferenceId, selectedUnavailabilityId, deletePreferenceMutation, deleteUnavailabilityMutation]);

    const handleTimezoneChange = useCallback(
        (event) => {
            const newTimezone = event.target.value;
            updateTimezoneMutation.mutate({ timezone: newTimezone });
        },
        [updateTimezoneMutation]
    );

    const MotionCard = motion.create(Card);

    return (
        <Layout drawerItems={DRAWER_ITEMS}>
            <Box sx={{ maxWidth: '900px', width: '100%', margin: '0 auto', py: { xs: 2, md: 4 } }}>
                <Fade in={!!error || !!success || !!apiError} timeout={500}>
                    <Box>
                        {(error || success || apiError) && (
                            <Alert
                                severity={error || apiError ? 'error' : 'success'}
                                sx={{ mb: 3, borderRadius: 2 }}
                                aria-live="assertive"
                            >
                                {error ||
                                    apiError?.message ||
                                    success ||
                                    (preferencesError
                                        ? 'Failed to load study preferences'
                                        : unavailabilitiesError
                                            ? 'Failed to load unavailabilities'
                                            : 'Failed to load settings data')}
                            </Alert>
                        )}
                    </Box>
                </Fade>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                    aria-label="Settings page"
                >
                    Settings
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress aria-label="Loading settings" />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <MotionCard
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: theme.shadows[4],
                                    bgcolor: theme.palette.background.paper,
                                    '&:hover': { boxShadow: theme.shadows[6] },
                                    transition: 'box-shadow 0.3s',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                                        aria-label="Account settings"
                                    >
                                        Account Settings
                                    </Typography>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }} aria-label="Theme selection">
                                            Theme
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={themeMode === 'dark'}
                                                    onChange={handleThemeChange}
                                                    color="primary"
                                                    inputProps={{ 'aria-label': 'Toggle dark mode' }}
                                                />
                                            }
                                            label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                        />
                                    </Box>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }} aria-label="Notification settings">
                                            Notifications
                                        </Typography>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={notifications.email}
                                                        onChange={() => handleNotificationChange('email')}
                                                        color="primary"
                                                        inputProps={{ 'aria-label': 'Toggle email notifications' }}
                                                    />
                                                }
                                                label="Email Notifications"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={notifications.push}
                                                        onChange={() => handleNotificationChange('push')}
                                                        color="primary"
                                                        inputProps={{ 'aria-label': 'Toggle push notifications' }}
                                                    />
                                                }
                                                label="Push Notifications"
                                            />
                                        </FormGroup>
                                    </Box>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }} aria-label="Timezone selection">
                                            Timezone
                                        </Typography>
                                        <FormControl fullWidth>
                                            <InputLabel id="timezone-select-label">Timezone</InputLabel>
                                            <Select
                                                labelId="timezone-select-label"
                                                value={user.timezone || 'Asia/Manila'}
                                                onChange={handleTimezoneChange}
                                                label="Timezone"
                                                disabled={updateTimezoneMutation.isLoading}
                                                inputProps={{ 'aria-label': 'Select timezone' }}
                                            >
                                                <MenuItem value="Asia/Manila">Philippines (Asia/Manila)</MenuItem>
                                                <MenuItem value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</MenuItem>
                                                <MenuItem value="Europe/London">GMT (Europe/London)</MenuItem>
                                                <MenuItem value="Asia/Tokyo">Japan (Asia/Tokyo)</MenuItem>
                                                <MenuItem value="Australia/Sydney">Sydney (Australia/Sydney)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </CardContent>
                            </MotionCard>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                                    aria-label="Study preferences"
                                >
                                    Study Preferences
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handlePreferenceModalOpen()}
                                    disabled={loading}
                                    sx={{
                                        py: 1,
                                        px: 3,
                                        borderRadius: 2,
                                        '&:hover': { transform: 'scale(1.05)' },
                                        transition: 'transform 0.2s',
                                    }}
                                    aria-label="Add new study preference"
                                >
                                    Add Preference
                                </Button>
                            </Box>
                            <MotionCard
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: theme.shadows[4],
                                    bgcolor: theme.palette.background.paper,
                                    '&:hover': { boxShadow: theme.shadows[6] },
                                    transition: 'box-shadow 0.3s',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                    {preferences.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No study preferences set.
                                        </Typography>
                                    ) : (
                                        preferences.map((pref, index) => (
                                            <MotionCard
                                                key={pref.id}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    border: 1,
                                                    borderColor: theme.palette.divider,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    bgcolor: theme.palette.background.default,
                                                    '&:hover': { boxShadow: theme.shadows[3] },
                                                    transition: 'box-shadow 0.3s',
                                                }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Box>
                                                    <Typography
                                                        variant="body1"
                                                        aria-label={`Preference: ${pref.day} from ${pref.startTime} to ${pref.endTime}`}
                                                    >
                                                        {pref.day}: {pref.startTime} - {pref.endTime}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        aria-label={`Preferred slot duration: ${pref.preferredSlotDuration} minutes`}
                                                    >
                                                        Preferred Slot Duration: {pref.preferredSlotDuration} minutes
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        aria-label={`Productivity score: ${pref.productivityScore}`}
                                                    >
                                                        Productivity Score: {pref.productivityScore}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        onClick={() => handlePreferenceModalOpen(pref)}
                                                        variant="outlined"
                                                        size="small"
                                                        disabled={loading}
                                                        sx={{ borderRadius: 2 }}
                                                        aria-label={`Edit preference for ${pref.day}`}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handlePreferenceDelete(pref.id)}
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        disabled={loading}
                                                        sx={{ borderRadius: 2 }}
                                                        aria-label={`Delete preference for ${pref.day}`}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </MotionCard>
                                        ))
                                    )}
                                </CardContent>
                            </MotionCard>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                                    aria-label="Unavailabilities"
                                >
                                    Unavailabilities
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleUnavailabilityModalOpen()}
                                    disabled={loading}
                                    sx={{
                                        py: 1,
                                        px: 3,
                                        borderRadius: 2,
                                        '&:hover': { transform: 'scale(1.05)' },
                                        transition: 'transform 0.2s',
                                    }}
                                    aria-label="Add new unavailability"
                                >
                                    Add Unavailability
                                </Button>
                            </Box>
                            <MotionCard
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: theme.shadows[4],
                                    bgcolor: theme.palette.background.paper,
                                    '&:hover': { boxShadow: theme.shadows[6] },
                                    transition: 'box-shadow 0.3s',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                    {unavailabilities.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No unavailabilities set.
                                        </Typography>
                                    ) : (
                                        unavailabilities.map((unavail, index) => (
                                            <MotionCard
                                                key={unavail.id}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    border: 1,
                                                    borderColor: theme.palette.divider,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    bgcolor: theme.palette.background.default,
                                                    '&:hover': { boxShadow: theme.shadows[3] },
                                                    transition: 'box-shadow 0.3s',
                                                }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Box>
                                                    <Typography
                                                        variant="body1"
                                                        aria-label={`Unavailability from ${new Date(unavail.startTime).toLocaleString()} to ${new Date(unavail.endTime).toLocaleString()}`}
                                                    >
                                                        {new Date(unavail.startTime).toLocaleString()} -{' '}
                                                        {new Date(unavail.endTime).toLocaleString()}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        aria-label={`Unavailability description: ${unavail.description || 'No description'}`}
                                                    >
                                                        {unavail.description || 'No description'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        onClick={() => handleUnavailabilityModalOpen(unavail)}
                                                        variant="outlined"
                                                        size="small"
                                                        disabled={loading}
                                                        sx={{ borderRadius: 2 }}
                                                        aria-label="Edit unavailability"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUnavailabilityDelete(unavail.id)}
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        disabled={loading}
                                                        sx={{ borderRadius: 2 }}
                                                        aria-label="Delete unavailability"
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </MotionCard>
                                        ))
                                    )}
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    </Grid>
                )}
                <PreferenceModal
                    open={preferenceModalOpen}
                    onClose={handlePreferenceModalClose}
                    preference={selectedPreference}
                    preferenceId={selectedPreferenceId}
                    userId={user.id}
                    onSave={handlePreferenceSave}
                    onError={(err) => setError(err)}
                    onSuccess={setSuccess}
                    isLoading={
                        createPreferenceMutation.isLoading || updatePreferenceMutation.isLoading
                    }
                    error={error}
                    existingPreferences={preferences}
                />
                <Dialog
                    open={unavailabilityModalOpen}
                    onClose={handleUnavailabilityModalClose}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="unavailability-dialog-title"
                    TransitionComponent={Slide}
                    TransitionProps={{ direction: 'up' }}
                >
                    <DialogTitle id="unavailability-dialog-title">
                        {selectedUnavailabilityId ? 'Edit Unavailability' : 'Add Unavailability'}
                    </DialogTitle>
                    <DialogContent dividers sx={{ pt: 2 }}>
                        <Fade in={!!error || !!success} timeout={500}>
                            <Box>
                                {(error || success) && (
                                    <Alert
                                        severity={error ? 'error' : 'success'}
                                        sx={{ mb: 2, borderRadius: 2 }}
                                        aria-live="assertive"
                                    >
                                        {error || success}
                                    </Alert>
                                )}
                            </Box>
                        </Fade>
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            value={newUnavailability.startTime}
                            onChange={(e) =>
                                setNewUnavailability({
                                    ...newUnavailability,
                                    startTime: e.target.value,
                                })
                            }
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                            error={!!error && !newUnavailability.startTime}
                            helperText={
                                error && !newUnavailability.startTime
                                    ? 'Start time is required'
                                    : ''
                            }
                            aria-label="Start time for unavailability"
                            inputProps={{ 'aria-required': true }}
                        />
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            value={newUnavailability.endTime}
                            onChange={(e) =>
                                setNewUnavailability({
                                    ...newUnavailability,
                                    endTime: e.target.value,
                                })
                            }
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                            error={!!error && !newUnavailability.endTime}
                            helperText={
                                error && !newUnavailability.endTime ? 'End time is required' : ''
                            }
                            aria-label="End time for unavailability"
                            inputProps={{ 'aria-required': true }}
                        />
                        <TextField
                            label="Description"
                            value={newUnavailability.description}
                            onChange={(e) =>
                                setNewUnavailability({
                                    ...newUnavailability,
                                    description: e.target.value,
                                })
                            }
                            fullWidth
                            sx={{ mb: 2 }}
                            multiline
                            rows={3}
                            aria-label="Description for unavailability"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleUnavailabilityReset}
                            disabled={
                                createUnavailabilityMutation.isLoading ||
                                updateUnavailabilityMutation.isLoading
                            }
                            sx={{ borderRadius: 2 }}
                            aria-label="Reset unavailability form"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleUnavailabilityModalClose}
                            disabled={
                                createUnavailabilityMutation.isLoading ||
                                updateUnavailabilityMutation.isLoading
                            }
                            sx={{ borderRadius: 2 }}
                            aria-label="Cancel unavailability changes"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUnavailabilitySave}
                            variant="contained"
                            color="primary"
                            disabled={
                                createUnavailabilityMutation.isLoading ||
                                updateUnavailabilityMutation.isLoading
                            }
                            sx={{ borderRadius: 2, px: 3 }}
                            aria-label="Save unavailability"
                        >
                            {createUnavailabilityMutation.isLoading ||
                            updateUnavailabilityMutation.isLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    maxWidth="xs"
                    fullWidth
                    aria-labelledby="delete-confirm-dialog-title"
                    TransitionComponent={Slide}
                    TransitionProps={{ direction: 'up' }}
                >
                    <DialogTitle id="delete-confirm-dialog-title">Confirm Delete</DialogTitle>
                    <DialogContent dividers sx={{ pt: 2 }}>
                        <Typography aria-label={`Confirm deletion of ${deleteType}`}>
                            Are you sure you want to delete this {deleteType}?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDeleteConfirmOpen(false)}
                            disabled={
                                deletePreferenceMutation.isLoading ||
                                deleteUnavailabilityMutation.isLoading
                            }
                            sx={{ borderRadius: 2 }}
                            aria-label="Cancel deletion"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant="contained"
                            color="error"
                            disabled={
                                deletePreferenceMutation.isLoading ||
                                deleteUnavailabilityMutation.isLoading
                            }
                            sx={{ borderRadius: 2, px: 3 }}
                            aria-label={`Confirm deletion of ${deleteType}`}
                        >
                            {deletePreferenceMutation.isLoading ||
                            deleteUnavailabilityMutation.isLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default React.memo(Settings);