import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { licenseService } from '../../services/api';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    AppBar,
    Toolbar,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const LicenseInfo = () => {
    const navigate = useNavigate();
    const [licenseData, setLicenseData] = useState(null);

    useEffect(() => {
        loadLicenseInfo();
    }, []);

    const loadLicenseInfo = async () => {
        try {
            const response = await licenseService.getInfo();
            if (response.success) {
                setLicenseData(response.data);
            }
        } catch (error) {
            console.error('Error loading license:', error);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" onClick={() => navigate('/dashboard')}>
                        <ArrowBack sx={{ mr: 1 }} /> Volver
                    </Button>
                    <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
                        Información de Licencia
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {licenseData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Detalles de Licencia
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Clave:</strong> {licenseData.license.license_key}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Tipo:</strong> {licenseData.license.license_type.toUpperCase()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Compañía:</strong> {licenseData.license.company_name}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Estado:</strong> {licenseData.license.status}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Vencimiento:</strong>{' '}
                                        {new Date(licenseData.license.expiration_date).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Días Restantes:</strong> {licenseData.license.days_remaining}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Usuarios Activos:</strong> {licenseData.license.active_users} /{' '}
                                        {licenseData.license.max_users}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default LicenseInfo;
