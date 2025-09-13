import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

interface NotificationProps {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function Notification({ show, message, type, onClose }: NotificationProps) {
    console.log('Notification component render:', { show, message, type });
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
            case 'error':
                return <ErrorIcon sx={{ color: '#f44336' }} />;
            default:
                return <InfoIcon sx={{ color: '#2196f3' }} />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#e8f5e8';
            case 'error':
                return '#ffebee';
            default:
                return '#e3f2fd';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return '#4caf50';
            case 'error':
                return '#f44336';
            default:
                return '#2196f3';
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 9999,
                backgroundColor: getBackgroundColor(),
                border: `2px solid ${getBorderColor()}`,
                borderRadius: 2,
                padding: 2,
                minWidth: 300,
                maxWidth: 400,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                animation: 'slideIn 0.3s ease-out',
                '@keyframes slideIn': {
                    from: {
                        transform: 'translateX(100%)',
                        opacity: 0
                    },
                    to: {
                        transform: 'translateX(0)',
                        opacity: 1
                    }
                }
            }}
        >
            {getIcon()}
            <Typography
                sx={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333'
                }}
            >
                {message}
            </Typography>
            <IconButton
                size="small"
                onClick={onClose}
                sx={{
                    color: '#666',
                    '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.1)'
                    }
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );
} 