import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ initial: 'U', id: null, name: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
        } else {
            fetchCurrentUser();
        }
    }, [navigate]);

    const fetchCurrentUser = async (retryCount = 0) => {
        setLoading(true);
        try {
            const response = await getCurrentUser();
            const userData = response.data;
            setUser({
                initial: userData.name ? userData.name.charAt(0).toUpperCase() : 'U',
                id: userData.id,
                name: userData.name || 'Unknown',
                email: userData.email || '',
                createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : '',
                timezone: userData.timezone || '',
            });
            setError(null);
        } catch (error) {
            if (retryCount < 2) {
                setTimeout(() => fetchCurrentUser(retryCount + 1), 1000 * Math.pow(2, retryCount));
            } else {
                console.error('Failed to fetch user:', error);
                setError(error.message || 'Unable to load user data. Please try again later.');
                localStorage.removeItem('token');
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, error, fetchCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};