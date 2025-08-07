import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';

interface SaleBannerProps {
  isVisible?: boolean;
  onBuyNowClick?: () => void;
}

export default function SaleBanner({ isVisible = true, onBuyNowClick }: SaleBannerProps) {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        background: '#FFD700',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
        border: '2px solid #FFA500',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          borderRadius: '12px',
        },
        '@keyframes pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: 0.3
          },
          '50%': { 
            transform: 'scale(1.1)',
            opacity: 0.6
          },
        }
      }}
    >
      {/* Abstract Geometric Elements */}
      {/* Top Left Corner */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20px',
          left: '-30px',
          width: '120px',
          height: '80px',
          background: 'rgba(255, 193, 7, 0.3)',
          borderRadius: '20px',
          transform: 'rotate(-15deg)',
          zIndex: 1
        }}
      />
      
      {/* Top Right Corner */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15px',
          right: '-25px',
          width: '100px',
          height: '60px',
          background: 'rgba(255, 193, 7, 0.4)',
          borderRadius: '15px',
          transform: 'rotate(20deg)',
          zIndex: 1
        }}
      />
      
      {/* Bottom Left Corner */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-25px',
          left: '-20px',
          width: '80px',
          height: '100px',
          background: 'rgba(255, 193, 7, 0.25)',
          borderRadius: '25px',
          transform: 'rotate(10deg)',
          zIndex: 1
        }}
      />
      
      {/* Bottom Right Corner */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30px',
          right: '-15px',
          width: '110px',
          height: '70px',
          background: 'rgba(255, 193, 7, 0.35)',
          borderRadius: '18px',
          transform: 'rotate(-25deg)',
          zIndex: 1
        }}
      />
      
      {/* Center Top Element */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '40px',
          background: 'rgba(255, 193, 7, 0.2)',
          borderRadius: '12px',
          zIndex: 1
        }}
      />
      
      {/* Center Bottom Element */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '30px',
          background: 'rgba(255, 193, 7, 0.3)',
          borderRadius: '10px',
          zIndex: 1
        }}
      />
      
      {/* Left Side Elements */}
      <Box
        sx={{
          position: 'absolute',
          left: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '30px',
          height: '80px',
          background: 'rgba(255, 193, 7, 0.25)',
          borderRadius: '8px',
          zIndex: 1
        }}
      />
      
      {/* Right Side Elements */}
      <Box
        sx={{
          position: 'absolute',
          right: '-8px',
          top: '40%',
          width: '25px',
          height: '60px',
          background: 'rgba(255, 193, 7, 0.3)',
          borderRadius: '6px',
          zIndex: 1
        }}
      />
      
      {/* Additional Small Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '20px',
          height: '20px',
          background: 'rgba(255, 193, 7, 0.4)',
          borderRadius: '50%',
          zIndex: 1
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          width: '15px',
          height: '15px',
          background: 'rgba(255, 193, 7, 0.35)',
          borderRadius: '50%',
          zIndex: 1
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '20%',
          width: '18px',
          height: '18px',
          background: 'rgba(255, 193, 7, 0.3)',
          borderRadius: '50%',
          zIndex: 1
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '35%',
          right: '25%',
          width: '12px',
          height: '12px',
          background: 'rgba(255, 193, 7, 0.4)',
          borderRadius: '50%',
          zIndex: 1
        }}
      />
      {/* Brand Logos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          position: 'relative',
          zIndex: 2,
          gap: 2,
          flexWrap: 'wrap',
          '@media (max-width: 768px)': {
            justifyContent: 'center',
            gap: 1
          }
        }}
      >
        {/* Nike */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '8px'
            }}
          >
            <Typography sx={{ color: '#E31E24', fontWeight: 900, fontSize: '20px' }}>
              ✓
            </Typography>
          </Box>
          <Typography sx={{ color: '#E31E24', fontWeight: 700, fontSize: '14px' }}>
            NIKE
          </Typography>
        </Box>

        {/* Adidas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '4px'
            }}
          >
            {/* Adidas Three Stripes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', mb: '2px' }}>
              <Box sx={{ width: '20px', height: '2px', background: '#000' }} />
              <Box sx={{ width: '20px', height: '2px', background: '#000' }} />
              <Box sx={{ width: '20px', height: '2px', background: '#000' }} />
            </Box>
            {/* Adidas Text */}
            <Typography sx={{ 
              color: '#000', 
              fontWeight: 600, 
              fontSize: '8px',
              textTransform: 'lowercase',
              letterSpacing: '0.5px'
            }}>
              adidas
            </Typography>
          </Box>
        </Box>

        {/* Vans */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '8px'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              {/* Vans Text with line */}
              <Typography sx={{ 
                color: '#000', 
                fontWeight: 900, 
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative'
              }}>
                VANS
              </Typography>
              {/* Horizontal line from V */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  width: '8px',
                  height: '2px',
                  background: '#000'
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Puma */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '4px'
            }}
          >
            {/* Puma Leaping Cat */}
            <Box
              sx={{
                width: '16px',
                height: '12px',
                position: 'relative',
                mb: '2px'
              }}
            >
              {/* Puma silhouette */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: '#E31E24',
                  borderRadius: '6px',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-2px',
                    left: '2px',
                    width: '8px',
                    height: '6px',
                    background: '#E31E24',
                    borderRadius: '3px',
                    transform: 'rotate(-15deg)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '2px',
                    right: '0',
                    width: '4px',
                    height: '8px',
                    background: '#E31E24',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)'
                  }
                }}
              />
            </Box>
            {/* Puma Text */}
            <Typography sx={{ 
              color: '#E31E24', 
              fontWeight: 700, 
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              PUMA
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Store Name */}
      <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 2 }}>
        <Typography variant="h6" sx={{ 
          color: 'white', 
          fontWeight: 700, 
          fontSize: '24px',
          fontStyle: 'italic'
        }}>
          SoleKing Store
        </Typography>
      </Box>

      {/* Main Sale Content */}
      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <Typography variant="h3" sx={{ 
          color: 'white', 
          fontWeight: 900, 
          fontSize: { xs: '2rem', md: '3rem' },
          mb: 1,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          SALE
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'white', 
          fontWeight: 600,
          mb: 2
        }}>
          UP TO OFF <Box component="span" sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            px: 2, 
            py: 0.5, 
            borderRadius: 1,
            display: 'inline-block'
          }}>50%</Box>
        </Typography>
        <Button
          variant="contained"
          onClick={onBuyNowClick}
          sx={{
            backgroundColor: '#FF6B35',
            color: 'white',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1.1rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#E55A2B'
            }
          }}
        >
          MUA NGAY
        </Button>
      </Box>
    </Box>
  );
} 