import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Collapse,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem as SelectMenuItem,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Delete, Add, CheckCircle } from '@mui/icons-material';
import { formatISO } from 'date-fns';
import {
    createCourse,
    createTask,
    deleteCourse,
    deleteTask,
    updateCourse,
    updateTask,
    updateTaskProgress,
    getSyncStatus
} from "../api.js";
import { useUser } from '../context/UserContext';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    },
    backgroundColor: theme.palette.background.paper,
}));

const CourseSection = ({ courses, tasks, fetchCourses, fetchTasks, userId, theme }) => {
    const { user } = useUser();
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', state: 'IN_PROGRESS' });
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        courseId: '',
        workType: 'ASSIGNMENT',
        priority: 'NORMAL',
        estimatedHours: '',
    });
    const [courseDialogOpen, setCourseDialogOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [syncStatus, setSyncStatus] = useState('NOT_STARTED');

    useEffect(() => {
        const loadTasks = async () => {
            try {
                await fetchTasks();
            } catch (err) {
                setFetchError('Failed to load tasks. Please try again.');
                console.error('Fetch tasks error:', err);
            }
        };
        loadTasks();

        if (user?.id && user?.isGoogleLogin) {
            const pollSyncStatus = async () => {
                try {
                    const response = await getSyncStatus();
                    setSyncStatus(response.data);
                    if (response.data === 'COMPLETED' || response.data === 'FAILED') {
                        await fetchCourses();
                        await fetchTasks();
                    } else {
                        setTimeout(pollSyncStatus, 2000);
                    }
                } catch (err) {
                    console.error('Failed to fetch sync status:', err);
                    setSyncStatus('FAILED');
                }
            };
            pollSyncStatus();
        }
    }, [fetchTasks, fetchCourses, user?.id, user?.isGoogleLogin]);

    const getRandomColor = () => {
        const colors = ['#1a73e8', '#34a853', '#fbbc05', '#ea4335', '#4285f4'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const validateCourse = () => {
        if (!newCourse.name.trim()) return 'Course name is required';
        if (!newCourse.state) return 'Course state is required';
        return null;
    };

    const validateTask = () => {
        if (!newTask.title.trim()) return 'Task title is required';
        if (!newTask.courseId) return 'Course is required';
        if (!newTask.estimatedHours || newTask.estimatedHours <= 0) return 'Estimated hours must be a positive number';
        if (newTask.dueDate && new Date(newTask.dueDate) < new Date()) return 'Due date cannot be in the past';
        return null;
    };

    const handleCourseDialogOpen = (course = { name: '', instructor: '', state: 'IN_PROGRESS' }) => {
        setNewCourse(course);
        setSelectedCourseId(course.id);
        setCourseDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleCourseDialogClose = () => {
        setCourseDialogOpen(false);
        setNewCourse({ name: '', instructor: '', state: 'IN_PROGRESS' });
        setSelectedCourseId(null);
    };

    const handleCourseSave = async () => {
        const validationError = validateCourse();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        try {
            if (selectedCourseId) {
                await updateCourse(selectedCourseId, { ...newCourse, userId });
                setSuccess('Course updated successfully');
            } else {
                await createCourse({ ...newCourse, userId });
                setSuccess('Course created successfully');
            }
            await fetchCourses();
            handleCourseDialogClose();
        } catch (error) {
            console.error('Failed to save course:', error);
            setError(error.response?.data?.error || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseDelete = (id) => {
        setDeleteType('course');
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleTaskDialogOpen = (task = {
        title: '',
        description: '',
        dueDate: '',
        courseId: '',
        workType: 'ASSIGNMENT',
        priority: 'NORMAL',
        estimatedHours: '',
    }) => {
        setNewTask(task);
        setSelectedTaskId(task.id || null);
        setTaskDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false);
        setNewTask({
            title: '',
            description: '',
            dueDate: '',
            courseId: '',
            workType: 'ASSIGNMENT',
            priority: 'NORMAL',
            estimatedHours: '',
        });
        setSelectedTaskId(null);
    };

    const handleTaskSave = async () => {
        const validationError = validateTask();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        try {
            const taskData = {
                ...newTask,
                userId,
                dueDate: newTask.dueDate ? formatISO(new Date(newTask.dueDate)) : null,
                estimatedHours: parseInt(newTask.estimatedHours) || null,
                source: selectedTaskId ? newTask.source : 'MANUAL',
            };
            if (selectedTaskId) {
                await updateTask(selectedTaskId, taskData);
                setSuccess('Task updated successfully');
            } else {
                await createTask(taskData);
                setSuccess('Task created successfully');
            }
            await fetchTasks();
            handleTaskDialogClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            setError(error.response?.data?.error || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskDelete = (id) => {
        setDeleteType('task');
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            if (deleteType === 'course') {
                await deleteCourse(deleteId);
                setSuccess('Course deleted successfully');
                await fetchCourses();
            } else if (deleteType === 'task') {
                await deleteTask(deleteId);
                setSuccess('Task deleted successfully');
                await fetchTasks();
            }
            setDeleteDialogOpen(false);
            setDeleteId(null);
            setDeleteType(null);
        } catch (error) {
            console.error(`Failed to delete ${deleteType}:`, error);
            setError(error.response?.data?.error || `Failed to delete ${deleteType}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskProgress = async (taskId, status) => {
        setLoading(true);
        try {
            await updateTaskProgress(taskId, { status });
            setSuccess('Task status updated successfully');
            await fetchTasks();
        } catch (error) {
            console.error('Failed to update task progress:', error);
            setError(error.response?.data?.error || 'Failed to update task progress');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Typography>Loading user data...</Typography>;
    }

    return (
        <>
            {(fetchError || error || success || syncStatus === 'IN_PROGRESS' || syncStatus === 'FAILED') && (
                <Alert
                    severity={fetchError || error || syncStatus === 'FAILED' ? 'error' : success ? 'success' : 'info'}
                    sx={{ mb: 2 }}
                    role="alert"
                    action={
                        syncStatus === 'FAILED' && (
                            <Button
                                variant="text"
                                color="primary"
                                onClick={async () => {
                                    try {
                                        await getSyncStatus(); // Trigger polling again
                                        setSyncStatus('IN_PROGRESS');
                                        pollSyncStatus();
                                    } catch (err) {
                                        console.error('Failed to trigger sync:', err);
                                        setSyncStatus('FAILED');
                                    }
                                }}
                                aria-label="Retry sync"
                            >
                                Retry
                            </Button>
                        )
                    }
                >
                    {fetchError ||
                        error ||
                        success ||
                        (syncStatus === 'IN_PROGRESS' && 'Fetching courses and tasks from Google Classroom...') ||
                        (syncStatus === 'FAILED' && 'Failed to fetch courses and tasks from Google Classroom. Please try again.')}
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Active Courses
                </Typography>
                <Tooltip title="Add a New Course" arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => handleCourseDialogOpen()}
                        sx={{ borderRadius: 20, textTransform: 'none' }}
                        aria-label="Add a new course"
                        disabled={loading}
                    >
                        Add Course
                    </Button>
                </Tooltip>
            </Box>
            <Grid container spacing={2}>
                {courses.length === 0 && syncStatus !== 'IN_PROGRESS' ? (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
                        No active courses found. Add a course to get started!
                    </Typography>
                ) : (
                    courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <StyledCard>
                                <CardHeader
                                    sx={{
                                        bgcolor: getRandomColor(),
                                        color: '#fff',
                                        p: 2,
                                        minHeight: 80,
                                    }}
                                    title={
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {course.name}
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                            {course.instructor || 'No instructor'}
                                        </Typography>
                                    }
                                />
                                <CardContent sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? '#2c2c2c' : '#fafafa' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {tasks.filter((task) => task.courseId === course.id).length} Task(s)
                                        </Typography>
                                        <Button
                                            onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                            variant="text"
                                            color="primary"
                                            sx={{ textTransform: 'none' }}
                                            aria-label={`View tasks for ${course.name}`}
                                        >
                                            {expandedCourse === course.id ? 'Hide Tasks' : 'View Tasks'}
                                        </Button>
                                    </Box>
                                </CardContent>
                                <Collapse in={expandedCourse === course.id}>
                                    <CardContent sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                                Tasks
                                            </Typography>
                                            <Tooltip title="Add Task to this Course" arrow>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Add />}
                                                    onClick={() => handleTaskDialogOpen({ courseId: course.id })}
                                                    sx={{ borderRadius: 20, textTransform: 'none', fontSize: '0.85rem' }}
                                                    aria-label={`Add task to ${course.name}`}
                                                    disabled={loading}
                                                >
                                                    Add Task
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                        {tasks.filter((task) => task.courseId === course.id).length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                No tasks for this course.
                                            </Typography>
                                        ) : (
                                            tasks
                                                .filter((task) => task.courseId === course.id)
                                                .slice(0, 5)
                                                .map((task) => (
                                                    <Box
                                                        key={task.id}
                                                        sx={{
                                                            mb: 2,
                                                            p: 1.5,
                                                            borderRadius: 1,
                                                            bgcolor: theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                                                {task.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                                            </Typography>
                                                            <Chip
                                                                label={task.progress?.status || 'NOT_STARTED'}
                                                                color={task.progress?.status === 'COMPLETED' ? 'success' : 'default'}
                                                                size="small"
                                                                sx={{ mt: 0.5 }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Mark as Completed" arrow>
                                                                <IconButton
                                                                    onClick={() => handleTaskProgress(task.id, 'COMPLETED')}
                                                                    color="success"
                                                                    size="small"
                                                                    aria-label={`Mark ${task.title} as completed`}
                                                                    disabled={loading}
                                                                >
                                                                    <CheckCircle fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Task" arrow>
                                                                <IconButton
                                                                    onClick={() => handleTaskDialogOpen(task)}
                                                                    color="primary"
                                                                    size="small"
                                                                    aria-label={`Edit task ${task.title}`}
                                                                    disabled={loading}
                                                                >
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Task" arrow>
                                                                <IconButton
                                                                    onClick={() => handleTaskDelete(task.id)}
                                                                    color="error"
                                                                    size="small"
                                                                    aria-label={`Delete task ${task.title}`}
                                                                    disabled={loading}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                ))
                                        )}
                                    </CardContent>
                                </Collapse>
                                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Tooltip title="Edit Course" arrow>
                                        <IconButton
                                            onClick={() => handleCourseDialogOpen(course)}
                                            color="primary"
                                            size="small"
                                            aria-label={`Edit course ${course.name}`}
                                            disabled={loading}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Course" arrow>
                                        <IconButton
                                            onClick={() => handleCourseDelete(course.id)}
                                            color="error"
                                            size="small"
                                            aria-label={`Delete course ${course.name}`}
                                            disabled={loading}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </StyledCard>
                        </Grid>
                    ))
                )}
            </Grid>

            <Dialog
                open={courseDialogOpen}
                onClose={handleCourseDialogClose}
                maxWidth="sm"
                fullWidth
                aria-labelledby="course-dialog-title"
            >
                <DialogTitle id="course-dialog-title">{selectedCourseId ? 'Edit Course' : 'Add Course'}</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    {(error || success) && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }} role="alert">
                            {error || success}
                        </Alert>
                    )}
                    <TextField
                        label="Course Name"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        error={!!error && !newCourse.name}
                        helperText={error && !newCourse.name ? 'Course name is required' : ''}
                        aria-label="Course name input"
                        inputProps={{ 'aria-required': true }}
                    />
                    <TextField
                        label="Instructor"
                        value={newCourse.instructor}
                        onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        aria-label="Instructor name input"
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="course-state-select-label">Course State</InputLabel>
                        <Select
                            labelId="course-state-select-label"
                            value={newCourse.state}
                            onChange={(e) => setNewCourse({ ...newCourse, state: e.target.value })}
                            label="Course State"
                            aria-label="Select course state"
                        >
                            <SelectMenuItem value="IN_PROGRESS">In Progress</SelectMenuItem>
                            <SelectMenuItem value="COMPLETED">Completed</SelectMenuItem>
                            <SelectMenuItem value="DROPPED">Dropped</SelectMenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCourseDialogClose} disabled={loading} aria-label="Cancel course dialog">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCourseSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        aria-label={selectedCourseId ? 'Save course changes' : 'Create course'}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={taskDialogOpen}
                onClose={handleTaskDialogClose}
                maxWidth="sm"
                fullWidth
                aria-labelledby="task-dialog-title"
            >
                <DialogTitle id="task-dialog-title">{selectedTaskId ? 'Edit Task' : 'Add Task'}</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    {(error || success) && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }} role="alert">
                            {error || success}
                        </Alert>
                    )}
                    <TextField
                        label="Title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        error={!!error && !newTask.title}
                        helperText={error && !newTask.title ? 'Task title is required' : ''}
                        aria-label="Task title input"
                        inputProps={{ 'aria-required': true }}
                    />
                    <TextField
                        label="Description"
                        value={newTask.description || ''}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        aria-label="Task description input"
                    />
                    <TextField
                        label="Due Date"
                        type="datetime-local"
                        value={newTask.dueDate || ''}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        aria-label="Task due date input"
                    />
                    <TextField
                        label="Estimated Hours"
                        type="number"
                        value={newTask.estimatedHours || ''}
                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) || '' })}
                        fullWidth
                        sx={{ mb: 2 }}
                        inputProps={{ min: 1, 'aria-required': true }}
                        error={!!error && (!newTask.estimatedHours || newTask.estimatedHours <= 0)}
                        helperText={error && (!newTask.estimatedHours || newTask.estimatedHours <= 0) ? 'Estimated hours must be a positive number' : ''}
                        aria-label="Task estimated hours input"
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="course-select-label">Course</InputLabel>
                        <Select
                            labelId="course-select-label"
                            value={newTask.courseId || ''}
                            disabled={true}
                            onChange={(e) => setNewTask({ ...newTask, courseId: e.target.value })}
                            label="Course"
                            aria-label="Select course"
                        >
                            {courses.map((course) => (
                                <SelectMenuItem key={course.id} value={course.id}>
                                    {course.name}
                                </SelectMenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="work-type-select-label">Work Type</InputLabel>
                        <Select
                            labelId="work-type-select-label"
                            value={newTask.workType}
                            onChange={(e) => setNewTask({ ...newTask, workType: e.target.value })}
                            label="Work Type"
                            aria-label="Select work type"
                        >
                            <SelectMenuItem value="ASSIGNMENT">Assignment</SelectMenuItem>
                            <SelectMenuItem value="QUIZ">Quiz</SelectMenuItem>
                            <SelectMenuItem value="EXAM">Exam</SelectMenuItem>
                            <SelectMenuItem value="PROJECT">Project</SelectMenuItem>
                            <SelectMenuItem value="READING">Reading</SelectMenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="priority-select-label">Priority</InputLabel>
                        <Select
                            labelId="priority-select-label"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            label="Priority"
                            aria-label="Select priority"
                        >
                            <SelectMenuItem value="LOW">Low</SelectMenuItem>
                            <SelectMenuItem value="NORMAL">Normal</SelectMenuItem>
                            <SelectMenuItem value="HIGH">High</SelectMenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTaskDialogClose} disabled={loading} aria-label="Cancel task dialog">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTaskSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        aria-label={selectedTaskId ? 'Save task changes' : 'Create task'}
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
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Typography>
                        Are you sure you want to delete this {deleteType}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading} aria-label="Cancel delete dialog">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={loading}
                        aria-label={`Confirm delete ${deleteType}`}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default React.memo(CourseSection);