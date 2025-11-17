import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { licenseService } from '../../services/api';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    AppBar,
    Toolbar,
    Alert,
} from '@mui/material';
import { Dashboard as DashboardIcon, ExitToApp, Info } from '@mui/icons-material';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [licenseInfo, setLicenseInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [infoRes, notifRes] = await Promise.all([
                licenseService.getInfo(),
                licenseService.getNotifications(),
            ]);

            if (infoRes.success) {
                setLicenseInfo(infoRes.data.license);
            }

            if (notifRes.success) {
                setNotifications(notifRes.data.notifications.filter((n) => !n.is_read));
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static">
                <Toolbar>
                    <DashboardIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Dashboard - {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/license')}>
                        <Info sx={{ mr: 1 }} /> Licencia
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        <ExitToApp sx={{ mr: 1 }} /> Salir
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Notificaciones importantes */}
                {notifications.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Tiene {notifications.length} notificación(es) pendiente(s)
                    </Alert>
                )}

                {/* Información de licencia */}
                {licenseInfo && licenseInfo.days_remaining <= 7 && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        Su licencia vencerá en {licenseInfo.days_remaining} días. Por favor renueve.
                    </Alert>
                )}

                <Typography variant="h4" gutterBottom>
                    Bienvenido a SystemSegure
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Información de Usuario
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Nombre:</strong> {user?.full_name || user?.username}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Email:</strong> {user?.email}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Rol:</strong> {user?.role}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Estado de Licencia
                                </Typography>
                                {licenseInfo && (
                                    <>
                                        <Typography variant="body2">
                                            <strong>Tipo:</strong> {licenseInfo.license_type.toUpperCase()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Estado:</strong> {licenseInfo.status}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Vencimiento:</strong>{' '}
                                            {new Date(licenseInfo.expiration_date).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Días restantes:</strong> {licenseInfo.days_remaining}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Área personalizable para el usuario */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Área Personalizable
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Esta sección puede ser personalizada según las necesidades del usuario.
                                Configure sus módulos, widgets o funcionalidades específicas aquí.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
