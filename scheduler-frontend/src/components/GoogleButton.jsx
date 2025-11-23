import React from 'react';
import { Button, SvgIcon } from '@mui/material';

const GoogleIcon = (props) => (
    <SvgIcon {...props} sx={{ fontSize: '1rem' }}>
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.854L12.545,10.239z" />
    </SvgIcon>
);

const GoogleButton = ({ disabled }) => {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={disabled}
            sx={{
                py: 0.75,
                fontSize: '0.875rem',
                textTransform: 'none',
                color: 'text.primary',
                borderColor: 'grey.300',
                '&:hover': { borderColor: 'grey.500', backgroundColor: 'grey.50' },
            }}
        >
            Sign in with Google
        </Button>
    );
};

export default GoogleButton;