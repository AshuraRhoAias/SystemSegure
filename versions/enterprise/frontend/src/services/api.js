import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 segundos
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y refrescar token
api.interceptors.response.use(
    (response) => {
        // Verificar si hay warning de licencia
        if (response.data.licenseWarning) {
            // Puedes mostrar una notificación aquí
            console.warn('License Warning:', response.data.licenseWarning);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró, intentar refrescarlo
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Reintentar petición original
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh, cerrar sesión
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// =====================================================
// SERVICIOS DE AUTENTICACIÓN
// =====================================================

export const authService = {
    // Login de administrador
    loginAdmin: async (username, password) => {
        const response = await api.post('/auth/login/admin', { username, password });
        return response.data;
    },

    // Login de usuario
    loginUser: async (username, password, license_key) => {
        const response = await api.post('/auth/login/user', {
            username,
            password,
            license_key,
        });
        return response.data;
    },

    // Registrar administrador
    registerAdmin: async (userData) => {
        const response = await api.post('/auth/register/admin', userData);
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return response.data;
    },

    // Refrescar token
    refreshToken: async (refreshToken) => {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    },
};

// =====================================================
// SERVICIOS DE LICENCIA
// =====================================================

export const licenseService = {
    // Verificar licencia
    verify: async (license_key) => {
        const response = await api.post('/license/verify', { license_key });
        return response.data;
    },

    // Obtener información de licencia
    getInfo: async () => {
        const response = await api.get('/license/info');
        return response.data;
    },

    // Renovar licencia
    renew: async (licenseData) => {
        const response = await api.post('/license/renew', licenseData);
        return response.data;
    },

    // Obtener notificaciones
    getNotifications: async () => {
        const response = await api.get('/license/notifications');
        return response.data;
    },

    // Marcar notificación como leída
    markNotificationRead: async (notificationId) => {
        const response = await api.put(`/license/notifications/${notificationId}/read`);
        return response.data;
    },

    // Generar nueva licencia (admin)
    generate: async (licenseData) => {
        const response = await api.post('/license/generate', licenseData);
        return response.data;
    },

    // Obtener estadísticas
    getStats: async () => {
        const response = await api.get('/license/stats');
        return response.data;
    },
};

// =====================================================
// MANEJO DE ERRORES
// =====================================================

export const handleApiError = (error) => {
    if (error.response) {
        // Error del servidor
        const message = error.response.data?.message || 'Error en el servidor';
        const status = error.response.status;

        return {
            message,
            status,
            requiresPayment: error.response.data?.requiresPayment || false,
            upgradeRequired: error.response.data?.upgradeRequired || false,
        };
    } else if (error.request) {
        // Error de red
        return {
            message: 'No se pudo conectar con el servidor. Verifique su conexión.',
            status: 0,
        };
    } else {
        // Otro error
        return {
            message: error.message || 'Error desconocido',
            status: -1,
        };
    }
};

export default api;
