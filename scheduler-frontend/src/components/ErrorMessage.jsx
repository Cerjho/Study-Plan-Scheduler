import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <Alert severity={message.includes('sent') ? 'success' : 'error'} sx={{ mb: 2 }} aria-live="assertive">
            <AlertTitle>{message.includes('sent') ? 'Success' : 'Error'}</AlertTitle>
            {message}
        </Alert>
    );
};

export default ErrorMessage;