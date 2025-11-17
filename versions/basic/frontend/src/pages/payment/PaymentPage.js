import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Alert,
} from '@mui/material';
import { Payment, ArrowBack } from '@mui/icons-material';

const PaymentPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Payment sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Renovación de Licencia
                        </Typography>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        Su licencia ha expirado o está próxima a vencer. Por favor, contacte con el
                        administrador para renovar su licencia.
                    </Alert>

                    <Typography variant="body1" paragraph>
                        Para renovar su licencia, por favor contacte con nuestro equipo de ventas:
                    </Typography>

                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Email:</strong> ventas@systemsegure.com
                        </Typography>
                        <Typography variant="body2">
                            <strong>Teléfono:</strong> +1 (555) 123-4567
                        </Typography>
                        <Typography variant="body2">
                            <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/login')}
                        >
                            Volver al Login
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => window.open('mailto:ventas@systemsegure.com', '_blank')}
                        >
                            Contactar Ventas
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PaymentPage;
