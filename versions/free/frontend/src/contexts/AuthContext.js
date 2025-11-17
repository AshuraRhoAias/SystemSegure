import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, handleApiError } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Cargar usuario desde localStorage al iniciar
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const accessToken = localStorage.getItem('accessToken');

                if (storedUser && accessToken) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                localStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login de administrador
    const loginAdmin = async (username, password) => {
        try {
            const response = await authService.loginAdmin(username, password);

            if (response.success) {
                const { user, accessToken, refreshToken } = response.data;

                // Guardar en localStorage
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorData = handleApiError(error);
            return { success: false, message: errorData.message };
        }
    };

    // Login de usuario
    const loginUser = async (username, password, license_key) => {
        try {
            const response = await authService.loginUser(username, password, license_key);

            if (response.success) {
                const { user, license, accessToken, refreshToken } = response.data;

                // Guardar en localStorage
                const userData = { ...user, license };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                setUser(userData);
                setIsAuthenticated(true);

                return { success: true, user: userData };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorData = handleApiError(error);
            return {
                success: false,
                message: errorData.message,
                requiresPayment: errorData.requiresPayment,
            };
        }
    };

    // Registrar administrador
    const registerAdmin = async (userData) => {
        try {
            const response = await authService.registerAdmin(userData);

            if (response.success) {
                return { success: true, data: response.data };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorData = handleApiError(error);
            return { success: false, message: errorData.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar estado y localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Verificar si es administrador
    const isAdmin = () => {
        return user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'support');
    };

    // Verificar si es super admin
    const isSuperAdmin = () => {
        return user && user.role === 'super_admin';
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        loginAdmin,
        loginUser,
        registerAdmin,
        logout,
        isAdmin,
        isSuperAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
