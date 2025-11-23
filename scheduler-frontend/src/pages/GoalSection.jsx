import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Delete, Add } from '@mui/icons-material';
import { createGoal, updateGoal, deleteGoal } from '../api';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper,
}));

const GoalSection = ({ goals, fetchGoals, userId, theme }) => {
    const [newGoal, setNewGoal] = useState({ hours: '', startDate: '', endDate: '' });
    const [goalDialogOpen, setGoalDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateGoal = () => {
        if (!newGoal.hours || newGoal.hours <= 0) return 'Hours must be a positive number';
        if (!newGoal.startDate || !newGoal.endDate) return 'Start and end dates are required';
        const start = new Date(newGoal.startDate);
        const end = new Date(newGoal.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date format';
        if (end <= start) return 'End date must be after start date';
        return null;
    };

    const handleGoalDialogOpen = (goal = { hours: '', startDate: '', endDate: '' }) => {
        setNewGoal({
            hours: goal.hours || '',
            startDate: goal.startDate || '',
            endDate: goal.endDate || '',
        });
        setSelectedGoalId(goal.id || null);
        setGoalDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleGoalDialogClose = () => {
        setGoalDialogOpen(false);
        setNewGoal({ hours: '', startDate: '', endDate: '' });
        setSelectedGoalId(null);
    };

    const handleGoalSave = async () => {
        const validationError = validateGoal();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        try {
            const goalData = { ...newGoal, userId };
            if (selectedGoalId) {
                await updateGoal(selectedGoalId, goalData);
                setSuccess('Goal updated successfully');
            } else {
                await createGoal(goalData);
                setSuccess('Goal created successfully');
            }
            await fetchGoals();
            handleGoalDialogClose();
        } catch (error) {
            console.error('Failed to save goal:', error);
            setError(error.message || 'Failed to save goal');
        } finally {
            setLoading(false);
        }
    };

    const handleGoalDelete = (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await deleteGoal(deleteId);
            setSuccess('Goal deleted successfully');
            await fetchGoals();
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete goal:', error);
            setError(error.message || 'Failed to delete goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Study Goals
                </Typography>
                <Tooltip title="Add a New Goal" arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => handleGoalDialogOpen()}
                        sx={{ borderRadius: 20, textTransform: 'none' }}
                        aria-label="Add a new study goal"
                        disabled={loading}
                    >
                        Add Goal
                    </Button>
                </Tooltip>
            </Box>
            <StyledCard>
                <CardContent sx={{ p: 3 }}>
                    {goals.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No goals set. Add a goal to track your study progress!
                        </Typography>
                    ) : (
                        goals.map((goal) => (
                            <Box
                                key={goal.id}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f9f9f9',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#333' : '#f0f0f0',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Chip
                                            label={`${goal.hours} hrs/wk`}
                                            color="primary"
                                            size="small"
                                            sx={{ fontWeight: 500 }}
                                        />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                                Study Goal
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                From: {goal.startDate ? new Date(goal.startDate).toLocaleDateString() : 'N/A'} - To:{' '}
                                                {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Edit Goal" arrow>
                                            <IconButton
                                                onClick={() => handleGoalDialogOpen(goal)}
                                                color="primary"
                                                size="small"
                                                aria-label="Edit study goal"
                                                disabled={loading}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Goal" arrow>
                                            <IconButton
                                                onClick={() => handleGoalDelete(goal.id)}
                                                color="error"
                                                size="small"
                                                aria-label="Delete study goal"
                                                disabled={loading}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    )}
                </CardContent>
            </StyledCard>

            <Dialog
                open={goalDialogOpen}
                onClose={handleGoalDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{selectedGoalId ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    {(error || success) && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
                            {error || success}
                        </Alert>
                    )}
                    <TextField
                        label="Hours per Week"
                        type="number"
                        value={newGoal.hours}
                        onChange={(e) => setNewGoal({ ...newGoal, hours: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0 }}
                        error={(!newGoal.hours || newGoal.hours <= 0) && !!error}
                        helperText={(!newGoal.hours || newGoal.hours <= 0) && error ? 'Hours must be positive' : ''}
                        aria-label="Hours per week input"
                    />
                    <TextField
                        label="Start Date"
                        type="date"
                        value={newGoal.startDate || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!error && !newGoal.startDate}
                        helperText={error && !newGoal.startDate ? 'Start date is required' : ''}
                        aria-label="Goal start date input"
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={newGoal.endDate || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!error && !newGoal.endDate}
                        helperText={error && !newGoal.endDate ? 'End date is required' : ''}
                        aria-label="Goal end date input"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleGoalDialogClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGoalSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Typography>Are you sure you want to delete this goal?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GoalSection;