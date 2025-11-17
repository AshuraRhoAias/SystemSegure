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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { AdminPanelSettings, ExitToApp } from '@mui/icons-material';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await licenseService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static" color="secondary">
                <Toolbar>
                    <AdminPanelSettings sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Panel de Administración - {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        <ExitToApp sx={{ mr: 1 }} /> Salir
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Panel de Control Administrativo
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Estadísticas de acceso */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Total Intentos</Typography>
                                <Typography variant="h3">
                                    {stats?.access_stats?.total_attempts || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Exitosos</Typography>
                                <Typography variant="h3" color="success.main">
                                    {stats?.access_stats?.successful_attempts || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Fallidos</Typography>
                                <Typography variant="h3" color="error.main">
                                    {stats?.access_stats?.failed_attempts || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Logs recientes */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Logs Recientes
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nivel</TableCell>
                                            <TableCell>Categoría</TableCell>
                                            <TableCell>Mensaje</TableCell>
                                            <TableCell>Fecha</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats?.recent_logs?.map((log, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{log.log_level}</TableCell>
                                                <TableCell>{log.category}</TableCell>
                                                <TableCell>{log.message}</TableCell>
                                                <TableCell>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        )) || (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No hay logs recientes
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Sesiones activas */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Sesiones Activas</Typography>
                                <Typography variant="h3">
                                    {stats?.active_sessions || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* IPs sospechosas */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">IPs con Intentos Fallidos</Typography>
                                <Typography variant="h3">
                                    {stats?.access_stats?.unique_failed_ips || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AdminDashboard;
