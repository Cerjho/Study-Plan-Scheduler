import React, { useState, useCallback } from 'react';
import {
    Modal,
    Box,
    Typography,
    Avatar,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Fade,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Alert,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { format, isValid } from 'date-fns';

const ProfileModal = ({
                          open,
                          onClose,
                          user,
                          loading,
                          error,
                          isEditingName,
                          editedName,
                          setIsEditingName,
                          setEditedName,
                          handleEditName,
                          handleSaveName,
                          theme,
                      }) => {
    const [saveLoading, setSaveLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [localError, setLocalError] = useState(null);

    const handleConfirmSave = useCallback(async () => {
        if (!editedName.trim()) {
            setLocalError('Name cannot be empty');
            return;
        }
        setSaveLoading(true);
        try {
            const result = await handleSaveName();
            if (result) {
                setLocalError(result);
            } else {
                setLocalError(null);
            }
        } catch (err) {
            setLocalError('Failed to update name. Please try again.');
        } finally {
            setSaveLoading(false);
            setConfirmOpen(false);
        }
    }, [editedName, handleSaveName]);

    const handleEditNameClick = useCallback(() => {
        setLocalError(null);
        handleEditName();
    }, [handleEditName]);

    const handleCancelEdit = useCallback(() => {
        setLocalError(null);
        setIsEditingName(false);
    }, [setIsEditingName]);

    const formatCreatedAt = (date) => {
        if (!date || !isValid(new Date(date))) return 'Not available';
        return format(new Date(date), 'MMMM d, yyyy');
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="profile-modal-title"
            aria-describedby="profile-modal-description"
            role="dialog"
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        outline: 'none',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Typography
                        id="profile-modal-title"
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                    >
                        User Profile
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={30} aria-label="Loading profile data" />
                        </Box>
                    ) : (
                        <>
                            {(error || localError) && (
                                <Alert severity="error" sx={{ mb: 2 }} role="alert">
                                    {error || localError}
                                </Alert>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        color: theme.palette.primary.contrastText,
                                        fontSize: 40,
                                        border: `2px solid ${theme.palette.primary.light}`,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                    aria-label={`User avatar for ${user.name}`}
                                >
                                    {user.initial}
                                </Avatar>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                            <Box sx={{ mb: 2 }}>
                                {isEditingName ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            flexDirection: { xs: 'column', sm: 'row' },
                                        }}
                                    >
                                        <TextField
                                            label="Name"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                                            sx={{
                                                '& .MuiInputBase-root': { color: theme.palette.text.primary },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.divider,
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }}
                                            aria-label="Edit user name"
                                            autoFocus
                                            error={!!localError && !editedName.trim()}
                                            helperText={
                                                localError && !editedName.trim() ? 'Name cannot be empty' : ''
                                            }
                                            inputProps={{ 'aria-required': true }}
                                        />
                                        <Tooltip title="Save name changes" arrow>
                                            <span>
                                                <Button
                                                    onClick={() => setConfirmOpen(true)}
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    disabled={saveLoading || !editedName.trim()}
                                                    aria-label="Confirm save name changes"
                                                >
                                                    {saveLoading ? <CircularProgress size={20} /> : 'Save'}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Cancel name editing" arrow>
                                            <Button
                                                onClick={handleCancelEdit}
                                                variant="outlined"
                                                size="small"
                                                disabled={saveLoading}
                                                aria-label="Cancel name editing"
                                            >
                                                Cancel
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: theme.palette.text.primary }}
                                            aria-label={`User name: ${user.name}`}
                                        >
                                            <strong>Name:</strong> {user.name}
                                        </Typography>
                                        <Tooltip title="Edit user name" arrow>
                                            <IconButton
                                                onClick={handleEditNameClick}
                                                size="small"
                                                aria-label="Edit user name"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                            <Typography
                                variant="body1"
                                sx={{ mb: 2, color: theme.palette.text.primary }}
                                aria-label={`User email: ${user.email}`}
                            >
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ mb: 3, color: theme.palette.text.primary }}
                                aria-label={`Account created: ${formatCreatedAt(user.createdAt)}`}
                            >
                                <strong>Account Created:</strong> {formatCreatedAt(user.createdAt)}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={onClose}
                                    variant="contained"
                                    color="primary"
                                    aria-label="Close profile modal"
                                >
                                    Close
                                </Button>
                            </Box>
                        </>
                    )}
                    <Dialog
                        open={confirmOpen}
                        onClose={() => setConfirmOpen(false)}
                        aria-labelledby="confirm-dialog-title"
                        aria-describedby="confirm-dialog-description"
                    >
                        <DialogTitle id="confirm-dialog-title">Confirm Name Change</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="confirm-dialog-description">
                                Are you sure you want to save the name "{editedName}"? This action cannot be
                                undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setConfirmOpen(false)}
                                color="primary"
                                disabled={saveLoading}
                                aria-label="Cancel name change"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmSave}
                                color="primary"
                                disabled={saveLoading}
                                aria-label="Confirm name change"
                            >
                                {saveLoading ? <CircularProgress size={20} /> : 'Confirm'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Fade>
        </Modal>
    );
};

export default React.memo(ProfileModal);