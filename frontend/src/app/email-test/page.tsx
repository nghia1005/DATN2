'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Alert, Paper } from '@mui/material';

export default function EmailTestPage() {
  const [email, setEmail] = useState('nghiavnph49789@gmail.com');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/email-test/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      console.log('Test result:', data);
    } catch (error) {
      setResults({
        error: true,
        message: `Lỗi kết nối: ${error}`
      });
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#b59d3a', fontWeight: 700 }}>
        Email Test Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Email để test:</Typography>
        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email để test"
          sx={{ mb: 2 }}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => testEndpoint('config')}
          disabled={loading}
          sx={{ bgcolor: '#1976d2' }}
        >
          Kiểm tra cấu hình SMTP
        </Button>

        <Button
          variant="contained"
          onClick={() => testEndpoint('diagnose')}
          disabled={loading}
          sx={{ bgcolor: '#388e3c' }}
        >
          Chẩn đoán vấn đề
        </Button>

        <Button
          variant="contained"
          onClick={() => testEndpoint('send-test', 'POST', { to: email, type: 'simple' })}
          disabled={loading}
          sx={{ bgcolor: '#f57c00' }}
        >
          Gửi email test đơn giản
        </Button>

        <Button
          variant="contained"
          onClick={() => testEndpoint('send-test', 'POST', { to: email, type: 'invoice' })}
          disabled={loading}
          sx={{ bgcolor: '#d32f2f' }}
        >
          Gửi email xác nhận đơn hàng
        </Button>
        
        <Button
          variant="contained"
          onClick={() => testEndpoint('send-direct', 'POST', { to: email, type: 'simple' })}
          disabled={loading}
          sx={{ bgcolor: '#9c27b0' }}
        >
          Gửi email trực tiếp (Test)
        </Button>
      </Box>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Đang xử lý...
        </Alert>
      )}

      {results && (
        <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Kết quả test:</Typography>
          
          {results.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {results.message}
            </Alert>
          ) : (
            <Box>
              {results.status && (
                <Alert severity={results.status === 'SUCCESS' ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {results.message}
                </Alert>
              )}
              
              {results.configStatus && (
                <Alert severity={results.configStatus === 'OK' ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {results.configMessage}
                </Alert>
              )}

              {results.suggestions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Gợi ý khắc phục:
                  </Typography>
                  <ul>
                    {results.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace', bgcolor: '#fff', p: 2, borderRadius: 1 }}>
                {JSON.stringify(results, null, 2)}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
} 