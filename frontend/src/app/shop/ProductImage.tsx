import React from 'react';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  duongDanHinhAnh?: string;
  alt?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ duongDanHinhAnh, alt = '', style, ...rest }) => {
  let src = '/logo.jpg';
  if (duongDanHinhAnh && duongDanHinhAnh.trim()) {
    if (duongDanHinhAnh.startsWith('/images/')) {
      src = `http://localhost:8080${duongDanHinhAnh}`;
    } else if (duongDanHinhAnh.startsWith('http')) {
      src = duongDanHinhAnh;
    } else {
      src = `http://localhost:8080/hinh-anh/view/${duongDanHinhAnh.replace(/^.*[\\/]/, '')}`;
    }
  }
  return <img src={src} alt={alt} style={style} {...rest} />;
};

export default ProductImage; 