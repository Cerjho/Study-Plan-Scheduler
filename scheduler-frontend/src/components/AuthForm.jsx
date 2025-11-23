import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Link, Box } from '@mui/material';

const AuthForm = ({ type, onSubmit, onForgotPassword, disabled }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleFormSubmit = (data) => {
        if (type === 'forgot' && onSubmit) {
            onSubmit(data);
        } else {
            onSubmit(data);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1.5 }}>
            {type === 'signup' && (
                <TextField
                    fullWidth
                    label="Name"
                    margin="normal"
                    size="small"
                    sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', py: 0.5 } }}
                    {...register('name', { required: 'Name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={disabled}
                />
            )}
            {type !== 'reset' && (
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
                    disabled={disabled}
                />
            )}
            {type !== 'forgot' && (
                <TextField
                    fullWidth
                    label={type === 'reset' ? 'New Password' : 'Password'}
                    type="password"
                    margin="normal"
                    size="small"
                    sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', py: 0.5 } }}
                    {...register(type === 'reset' ? 'newPassword' : 'password', {
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                        },
                    })}
                    error={!!errors[type === 'reset' ? 'newPassword' : 'password']}
                    helperText={errors[type === 'reset' ? 'newPassword' : 'password']?.message}
                    disabled={disabled}
                />
            )}
            {type === 'signin' && (
                <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                    <Link
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onForgotPassword?.();
                        }}
                        sx={{ color: '#1a73e8', textDecoration: 'none', fontSize: '0.75rem' }}
                    >
                        Forgot password?
                    </Link>
                </Box>
            )}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 1.5,
                    py: 0.75,
                    fontSize: '0.875rem',
                    backgroundColor: '#1a73e8',
                    '&:hover': { backgroundColor: '#1557b0' },
                }}
                disabled={disabled}
            >
                {type === 'signin' ? 'Sign In' : type === 'signup' ? 'Sign Up' : type === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
            </Button>
        </Box>
    );
};

export default AuthForm;