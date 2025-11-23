import { Home as HomeIcon, Schedule, Settings as SettingsIcon } from '@mui/icons-material';

export const DRAWER_WIDTH = 240;
export const COLLAPSED_DRAWER_WIDTH = 60;

export const DRAWER_ITEMS = [
    { text: 'Home', icon: <HomeIcon />, path: '/home', ariaLabel: 'Go to Home page' },
    { text: 'Calendar', icon: <Schedule />, path: '/schedules', ariaLabel: 'Go to Calendar page' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', ariaLabel: 'Go to Settings page' },
];