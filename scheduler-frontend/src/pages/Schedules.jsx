import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Tooltip,
    IconButton,
    Skeleton,
    Chip,
} from '@mui/material';
import { Add, Refresh, FilterAlt, Delete } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { RRule } from 'rrule';
import { styled } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatISO, startOfMonth, addMonths, isValid, parseISO } from 'date-fns';
import Layout from './Layout';
import { useUser } from '../context/UserContext';
import { getSchedulesByUser, generateStudyPlan } from '../api';
import { DRAWER_ITEMS } from '../constants';
import { debounce } from 'lodash';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper,
    transition: 'box-shadow 0.3s ease',
    '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
}));

const EventChip = styled(Chip)(({ theme, type }) => ({
    margin: theme.spacing(0.5),
    fontSize: '0.75rem',
    backgroundColor: type === 'auto' ? '#4CAF50' : '#2196F3',
    color: theme.palette.getContrastText(type === 'auto' ? '#4CAF50' : '#2196F3'),
}));

const Schedules = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading, error: userError } = useUser();
    const queryClient = useQueryClient();
    const [dateDialogOpen, setDateDialogOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'auto', 'manual'

    const defaultStart = formatISO(startOfMonth(new Date()));
    const defaultEnd = formatISO(addMonths(startOfMonth(new Date()), 1));

    const { data: schedules = [], isLoading: schedulesLoading, error: schedulesError, refetch } = useQuery({
        queryKey: ['schedules', user.id, defaultStart, defaultEnd, filterType],
        queryFn: () =>
            getSchedulesByUser(user.id, defaultStart, defaultEnd).then((res) =>
                res.data.slice(0, 100).flatMap((schedule) => {
                    const baseEvent = {
                        title: schedule.description || 'Study Session',
                        start: formatISO(new Date(schedule.startTime)),
                        end: formatISO(new Date(schedule.endTime)),
                        id: schedule.id,
                        backgroundColor: schedule.recurrenceRule ? '#4CAF50' : '#2196F3',
                        borderColor: schedule.recurrenceRule ? '#4CAF50' : '#2196F3',
                        extendedProps: { type: schedule.recurrenceRule ? 'auto' : 'manual' },
                    };

                    if (schedule.recurrenceRule && filterType !== 'manual') {
                        try {
                            const rrule = RRule.fromString(schedule.recurrenceRule);
                            const startDate = new Date(schedule.startTime);
                            const endDate = new Date(schedule.endTime);
                            const durationMs = endDate - startDate;
                            const startRange = new Date(defaultStart);
                            const endRange = new Date(defaultEnd);
                            const occurrences = rrule.between(startRange, endRange, true);
                            return occurrences.map((occurrence) => {
                                const occurrenceStart = new Date(occurrence);
                                const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
                                return {
                                    ...baseEvent,
                                    start: formatISO(occurrenceStart),
                                    end: formatISO(occurrenceEnd),
                                    id: `${baseEvent.id}-${occurrence.getTime()}`,
                                };
                            });
                        } catch (err) {
                            console.error(`Failed to parse recurrence rule for schedule ${schedule.id}: ${schedule.recurrenceRule}`, err);
                            setError('Some schedules have invalid recurrence rules. Please clear invalid schedules or regenerate the study plan.');
                            return [baseEvent];
                        }
                    }
                    return filterType !== 'auto' ? [baseEvent] : [];
                })
            ),
        enabled: !!user.id,
        retry: 2, // Re-enable retries for production
        retryDelay: (attempt) => 1000 * Math.pow(2, attempt),
    });

    const filteredEvents = useMemo(() => {
        return schedules.filter((event) => {
            if (filterType === 'all') return true;
            return event.extendedProps?.type === filterType;
        });
    }, [schedules, filterType]);

    const validateDates = useCallback(() => {
        if (!customStartDate || !customEndDate) return 'Please select both start and end dates';
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        if (!isValid(start) || !isValid(end)) return 'Invalid date format';
        if (end <= start) return 'End date must be after start date';
        return null;
    }, [customStartDate, customEndDate]);

    const debouncedHandleGenerateStudyPlan = useCallback(
        debounce(async (startDate, endDate, retryCount = 0) => {
            if (!user.id) {
                setError('User ID is required to generate study plan');
                return;
            }
            setIsGenerating(true);
            try {
                await generateStudyPlan(user.id, formatISO(startDate, { representation: 'date' }), formatISO(endDate, { representation: 'date' }));
                setSuccess('Study plan generated successfully!');
                setError(null);
                queryClient.invalidateQueries(['schedules', user.id, defaultStart, defaultEnd, filterType]);
                refetch();
            } catch (error) {
                console.error('Failed to generate study plan:', error);
                const errorMessage = error.message || 'Failed to generate study plan';
                if (errorMessage.includes('No available time slots found')) {
                    setError(`${errorMessage}. Please adjust your study preferences or unavailabilities in the Settings page.`);
                } else if (errorMessage.includes('endDate must be after startDate')) {
                    setError(errorMessage);
                } else if (retryCount < 2) {
                    setTimeout(() => debouncedHandleGenerateStudyPlan(startDate, endDate, retryCount + 1), 2000);
                    return;
                } else {
                    setError(errorMessage);
                }
            } finally {
                setIsGenerating(false);
            }
        }, 500),
        [user.id, refetch, queryClient]
    );

    const handleGenerateWithCustomDates = useCallback(() => {
        const validationError = validateDates();
        if (validationError) {
            setError(validationError);
            return;
        }
        debouncedHandleGenerateStudyPlan(new Date(customStartDate), new Date(customEndDate));
        setDateDialogOpen(false);
        setCustomStartDate('');
        setCustomEndDate('');
    }, [customStartDate, customEndDate, debouncedHandleGenerateStudyPlan, validateDates]);

    const handleClearInvalidSchedules = useCallback(async () => {
        if (!user.id) {
            setError('User ID is required to clear schedules');
            return;
        }
        setIsGenerating(true);
        try {
            // Fetch schedules and delete those with invalid recurrence rules
            const response = await getSchedulesByUser(user.id, defaultStart, defaultEnd);
            const invalidSchedules = response.data.filter(schedule => {
                if (!schedule.recurrenceRule) return false;
                try {
                    RRule.fromString(schedule.recurrenceRule);
                    return false;
                } catch (err) {
                    return true;
                }
            });
            for (const schedule of invalidSchedules) {
                await api.delete(`/schedules/${schedule.id}`);
            }
            setSuccess(`Cleared ${invalidSchedules.length} invalid schedules.`);
            setError(null);
            queryClient.invalidateQueries(['schedules', user.id, defaultStart, defaultEnd, filterType]);
            refetch();
        } catch (error) {
            console.error('Failed to clear invalid schedules:', error);
            setError('Failed to clear invalid schedules. Please try again or contact support.');
        } finally {
            setIsGenerating(false);
        }
    }, [user.id, queryClient, refetch, defaultStart, defaultEnd, filterType]);

    const handleDismissSuccess = () => setSuccess(null);
    const handleFilterChange = (type) => setFilterType(type);

    return (
        <Layout drawerItems={DRAWER_ITEMS}>
            <Box sx={{ maxWidth: '1200px', width: '100%', mx: 'auto', p: 2 }}>
                {(error || success || schedulesError) && (
                    <Alert
                        severity={error || schedulesError ? 'error' : 'success'}
                        sx={{ mb: 2, borderRadius: 1 }}
                        role="alert"
                        action={
                            (error || schedulesError) && (
                                <>
                                    {(error || schedulesError)?.includes('No available time slots found') && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => navigate('/settings')}
                                            sx={{ mr: 1 }}
                                            aria-label="Go to settings to adjust preferences"
                                        >
                                            Go to Settings
                                        </Button>
                                    )}
                                    <Button
                                        variant="text"
                                        color="primary"
                                        onClick={() =>
                                            debouncedHandleGenerateStudyPlan(
                                                new Date(customStartDate || defaultStart),
                                                new Date(customEndDate || defaultEnd)
                                            )
                                        }
                                        aria-label="Retry generating study plan"
                                    >
                                        Retry
                                    </Button>
                                    {error?.includes('invalid recurrence rules') && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={handleClearInvalidSchedules}
                                            aria-label="Clear invalid schedules"
                                        >
                                            Clear Invalid Schedules
                                        </Button>
                                    )}
                                    {success && (
                                        <Button
                                            variant="text"
                                            color="inherit"
                                            onClick={handleDismissSuccess}
                                            aria-label="Dismiss success message"
                                        >
                                            Dismiss
                                        </Button>
                                    )}
                                </>
                            )
                        }
                    >
                        {error || schedulesError?.message || success}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 0 }}
                        aria-label="Study schedule calendar"
                    >
                        Calendar
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="Refresh schedule" arrow>
                            <IconButton
                                onClick={() => refetch()}
                                disabled={isGenerating || userLoading}
                                aria-label="Refresh schedule"
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Filter events" arrow>
                            <IconButton
                                onClick={() => {
                                    setFilterType((prev) =>
                                        prev === 'all' ? 'auto' : prev === 'auto' ? 'manual' : 'all'
                                    );
                                }}
                                disabled={isGenerating || userLoading}
                                aria-label="Toggle event filter"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear invalid schedules" arrow>
                            <IconButton
                                onClick={handleClearInvalidSchedules}
                                disabled={isGenerating || userLoading}
                                aria-label="Clear invalid schedules"
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => debouncedHandleGenerateStudyPlan(new Date(defaultStart), new Date(defaultEnd))}
                            disabled={isGenerating || userLoading}
                            startIcon={isGenerating ? <CircularProgress size={20} /> : <Add />}
                            aria-label="Generate study plan for current month"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Study Plan'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setDateDialogOpen(true)}
                            disabled={isGenerating || userLoading}
                            aria-label="Select custom date range for study plan"
                        >
                            Custom Date Range
                        </Button>
                    </Box>
                </Box>
                {userLoading || schedulesLoading ? (
                    <Grid container spacing={2}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid item xs={12}>
                        <StyledCard>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{ fontWeight: 500, mb: 2 }}
                                    aria-label="Your study schedule"
                                >
                                    Your Study Schedule
                                    <Box sx={{ display: 'inline-flex', ml: 2 }}>
                                        <EventChip
                                            label="Auto"
                                            type="auto"
                                            onClick={() => handleFilterChange('auto')}
                                            color={filterType === 'auto' ? 'primary' : 'default'}
                                        />
                                        <EventChip
                                            label="Manual"
                                            type="manual"
                                            onClick={() => handleFilterChange('manual')}
                                            color={filterType === 'manual' ? 'primary' : 'default'}
                                        />
                                        <EventChip
                                            label="All"
                                            onClick={() => handleFilterChange('all')}
                                            color={filterType === 'all' ? 'primary' : 'default'}
                                        />
                                    </Box>
                                </Typography>
                                <div aria-label="Study schedule calendar">
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, rrulePlugin]}
                                        initialView="dayGridMonth"
                                        events={filteredEvents}
                                        timeZone="local"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                        }}
                                        eventClick={(info) => {
                                            const baseId = info.event.id.split('-')[0];
                                            navigate(`/schedules/${baseId}`);
                                        }}
                                        height="auto"
                                        eventContent={(arg) => (
                                            <Tooltip
                                                title={
                                                    <Box sx={{ p: 1 }}>
                                                        <Typography variant="body2">{arg.event.title}</Typography>
                                                        <Typography variant="caption">
                                                            {`Start: ${parseISO(arg.event.start).toLocaleString()}`}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {`End: ${parseISO(arg.event.end).toLocaleString()}`}
                                                        </Typography>
                                                    </Box>
                                                }
                                                arrow
                                            >
                                                <Box
                                                    sx={{
                                                        p: 0.5,
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
                                                    }}
                                                    aria-label={`Event: ${arg.event.title}`}
                                                >
                                                    {arg.event.title}
                                                </Box>
                                            </Tooltip>
                                        )}
                                        eventOverlap={false}
                                        dayMaxEvents={3}
                                        moreLinkClick="popover"
                                        customButtons={{
                                            today: {
                                                text: 'today',
                                                click: () => {
                                                    const today = new Date();
                                                    const calendarApi = document.querySelector('.fc').__calendar;
                                                    calendarApi.gotoDate(today);
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                )}
                <Dialog
                    open={dateDialogOpen}
                    onClose={() => setDateDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="date-dialog-title"
                >
                    <DialogTitle id="date-dialog-title">Select Date Range for Study Plan</DialogTitle>
                    <DialogContent>
                        {(error || success) && (
                            <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2, borderRadius: 1 }} role="alert">
                                {error || success}
                            </Alert>
                        )}
                        <TextField
                            label="Start Date"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                            error={!!error && !customStartDate}
                            helperText={error && !customStartDate ? 'Start date is required' : ''}
                            inputProps={{ 'aria-required': true }}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                            error={!!error && !customEndDate}
                            helperText={error && !customEndDate ? 'End date is required' : ''}
                            inputProps={{ 'aria-required': true }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDateDialogOpen(false)}
                            disabled={isGenerating}
                            aria-label="Cancel date range selection"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerateWithCustomDates}
                            variant="contained"
                            color="primary"
                            disabled={isGenerating}
                            aria-label="Generate study plan with custom dates"
                        >
                            {isGenerating ? <CircularProgress size={24} /> : 'Generate'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default React.memo(Schedules);