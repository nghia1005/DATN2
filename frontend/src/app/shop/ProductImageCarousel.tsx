import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleIcon from '@mui/icons-material/Circle';
import ProductImage from './ProductImage';

interface ProductImageCarouselProps {
  idChiTietSanPham: number;
  defaultImage?: string;
  alt?: string;
  style?: React.CSSProperties;
}

interface ImageData {
  idChiTietSanPhamHinhAnh: number;
  idChiTietSanPham: number;
  idHinhAnh: number;
  tenHinhAnh: string;
  urlHinhAnh: string;
  thuTu: number;
  laAnhChinh: boolean;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ 
  idChiTietSanPham, 
  defaultImage, 
  alt = '', 
  style 
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`http://localhost:8080/chi-tiet-san-pham-hinh-anh/${idChiTietSanPham}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setImages(data.data);
            // Tìm ảnh chính để hiển thị đầu tiên
            const mainImageIndex = data.data.findIndex((img: ImageData) => img.laAnhChinh);
            setCurrentIndex(mainImageIndex >= 0 ? mainImageIndex : 0);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [idChiTietSanPham]);

  // Auto-play khi hover
  useEffect(() => {
    if (isHovering && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      }, 1500);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovering, images.length]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Nếu không có hình ảnh hoặc chỉ có 1 hình, hiển thị như bình thường
  if (loading) {
    return (
      <Box sx={{ 
        width: style?.width || 140, 
        height: style?.height || 110, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: 8
      }}>
        <Box sx={{ width: 20, height: 20, border: '2px solid #ddd', borderTop: '2px solid #b59d3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  if (images.length <= 1) {
    return (
      <ProductImage
        duongDanHinhAnh={images[0]?.urlHinhAnh || defaultImage}
        alt={alt}
        style={style}
      />
    );
  }

  return (
    <Box 
      sx={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Hình ảnh chính */}
      <ProductImage
        duongDanHinhAnh={images[currentIndex]?.urlHinhAnh}
        alt={alt}
        style={style}
      />
      
      {/* Nút điều hướng */}
      <IconButton
        onClick={prevImage}
        sx={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
          width: 24,
          height: 24,
          zIndex: 2
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: 16 }} />
      </IconButton>
      
      <IconButton
        onClick={nextImage}
        sx={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
          width: 24,
          height: 24,
          zIndex: 2
        }}
      >
        <ChevronRightIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {/* Chỉ báo số lượng ảnh */}
      <Box sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: '12px',
        fontWeight: 600,
        zIndex: 2
      }}>
        {currentIndex + 1}/{images.length}
      </Box>

      {/* Dots indicator */}
      <Box sx={{
        position: 'absolute',
        bottom: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 0.5,
        zIndex: 2
      }}>
        {images.map((_, index) => (
          <IconButton
            key={index}
            onClick={() => goToImage(index)}
            sx={{
              p: 0,
              width: 8,
              height: 8,
              minWidth: 'auto'
            }}
          >
            <CircleIcon 
              sx={{ 
                fontSize: 8, 
                color: index === currentIndex ? '#b59d3a' : 'rgba(255, 255, 255, 0.6)',
                '&:hover': { color: '#b59d3a' }
              }} 
            />
          </IconButton>
        ))}
      </Box>

      {/* Hiệu ứng hover để hiển thị rõ hơn */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(181, 157, 58, 0.1), rgba(181, 157, 58, 0.05))',
        opacity: 0,
        transition: 'opacity 0.3s',
        borderRadius: 8,
        '&:hover': {
          opacity: 1
        }
      }} />
    </Box>
  );
};

export default ProductImageCarousel; 