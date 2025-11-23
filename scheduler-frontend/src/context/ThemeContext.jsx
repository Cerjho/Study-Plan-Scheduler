import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
    const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const handleThemeChange = (event) => {
            if (event.key === 'theme') {
                setThemeMode(event.newValue || 'light');
            }
        };

        window.addEventListener('storage', handleThemeChange);
        return () => window.removeEventListener('storage', handleThemeChange);
    }, []);

    const updateTheme = (mode) => {
        localStorage.setItem('theme', mode);
        setThemeMode(mode);
        window.dispatchEvent(new Event('themeChange'));
    };

    const theme = createTheme({
        palette: {
            mode: themeMode,
            primary: {
                main: '#1a73e8',
            },
            background: {
                default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
                paper: themeMode === 'dark' ? '#424242' : '#ffffff',
            },
            text: {
                primary: themeMode === 'dark' ? '#ffffff' : '#000000',
                secondary: themeMode === 'dark' ? '#bbbbbb' : '#666666',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ themeMode, updateTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};