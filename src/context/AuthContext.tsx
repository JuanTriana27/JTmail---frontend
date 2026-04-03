import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/authApi';
import { isAuthenticated, removeToken } from '../utils/auth';
import type { UserResponse } from '../types/user.types';


interface AuthContextType {
    currentUser: UserResponse | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Al montar la app, si hay token intenta cargar el usuario actual
        if (isAuthenticated()) {
            getMe()
                .then(setCurrentUser)
                .catch(() => removeToken()) // token expirado o inválido
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        removeToken();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);