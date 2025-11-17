import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Tabs,
    Tab,
    CircularProgress,
} from '@mui/material';
import { Lock, Person, Key } from '@mui/icons-material';

const Login = () => {
    const navigate = useNavigate();
    const { loginAdmin, loginUser } = useAuth();

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requiresPayment, setRequiresPayment] = useState(false);

    // Estado para login de admin
    const [adminCredentials, setAdminCredentials] = useState({
        username: '',
        password: '',
    });

    // Estado para login de usuario
    const [userCredentials, setUserCredentials] = useState({
        username: '',
        password: '',
        license_key: '',
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setError('');
        setRequiresPayment(false);
    };

    // Manejar login de administrador
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginAdmin(
                adminCredentials.username,
                adminCredentials.password
            );

            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    // Manejar login de usuario
    const handleUserLogin = async (e) => {
        e.preventDefault();
        setError('');
        setRequiresPayment(false);
        setLoading(true);

        try {
            const result = await loginUser(
                userCredentials.username,
                userCredentials.password,
                userCredentials.license_key
            );

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
                setRequiresPayment(result.requiresPayment || false);
            }
        } catch (err) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            SystemSegure
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Versión FREE - Sistema de Gestión de Licencias
                        </Typography>
                    </Box>

                    {/* Tabs para seleccionar tipo de login */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{ mb: 3 }}
                    >
                        <Tab label="Administrador" icon={<Person />} />
                        <Tab label="Usuario" icon={<Key />} />
                    </Tabs>

                    {/* Mensajes de error */}
                    {error && (
                        <Alert
                            severity={requiresPayment ? 'warning' : 'error'}
                            sx={{ mb: 2 }}
                        >
                            {error}
                            {requiresPayment && (
                                <Button
                                    size="small"
                                    sx={{ mt: 1 }}
                                    variant="outlined"
                                    onClick={() => navigate('/payment')}
                                >
                                    Renovar Licencia
                                </Button>
                            )}
                        </Alert>
                    )}

                    {/* Formulario de login de administrador */}
                    {tabValue === 0 && (
                        <form onSubmit={handleAdminLogin}>
                            <TextField
                                fullWidth
                                label="Usuario o Email"
                                variant="outlined"
                                margin="normal"
                                value={adminCredentials.username}
                                onChange={(e) =>
                                    setAdminCredentials({
                                        ...adminCredentials,
                                        username: e.target.value,
                                    })
                                }
                                required
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                label="Contraseña"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={adminCredentials.password}
                                onChange={(e) =>
                                    setAdminCredentials({
                                        ...adminCredentials,
                                        password: e.target.value,
                                    })
                                }
                                required
                                disabled={loading}
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Formulario de login de usuario */}
                    {tabValue === 1 && (
                        <form onSubmit={handleUserLogin}>
                            <TextField
                                fullWidth
                                label="Usuario o Email"
                                variant="outlined"
                                margin="normal"
                                value={userCredentials.username}
                                onChange={(e) =>
                                    setUserCredentials({
                                        ...userCredentials,
                                        username: e.target.value,
                                    })
                                }
                                required
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                label="Contraseña"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={userCredentials.password}
                                onChange={(e) =>
                                    setUserCredentials({
                                        ...userCredentials,
                                        password: e.target.value,
                                    })
                                }
                                required
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                label="Clave de Licencia"
                                variant="outlined"
                                margin="normal"
                                value={userCredentials.license_key}
                                onChange={(e) =>
                                    setUserCredentials({
                                        ...userCredentials,
                                        license_key: e.target.value,
                                    })
                                }
                                required
                                disabled={loading}
                                helperText="Ejemplo: FREE-XXXX-XXXX-XXXX-XXXX"
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Footer */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="textSecondary">
                            ¿No tiene cuenta?{' '}
                            <Button size="small" onClick={() => navigate('/register')}>
                                Registrarse
                            </Button>
                        </Typography>
                    </Box>
                </Paper>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                        © 2025 SystemSegure. Todos los derechos reservados.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Login;
