import React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

interface Brand { idThuongHieu: number; tenThuongHieu: string; }
interface Color { idMauSac: number; mauSac: string; }
interface Size { idKichCo: number; kichCo: string; }

interface SidebarFilterProps {
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColors: number[];
  setSelectedColors: React.Dispatch<React.SetStateAction<number[]>>;
  selectedSizes: number[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function SidebarFilter({ brands, colors, sizes, selectedBrands, setSelectedBrands, selectedColors, setSelectedColors, selectedSizes, setSelectedSizes }: SidebarFilterProps) {
  return (
    <div style={{ width: 260, background: '#fff', borderRadius: 4, boxShadow: '0 2px 12px #b59d3a22', padding: 24, height: 'fit-content', minWidth: 220 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#b59d3a', mb: 2 }}>Bộ lọc</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Hãng</Typography>
      <FormGroup>
        {Array.isArray(brands) && brands.map(b => (
          <FormControlLabel
            key={b.idThuongHieu}
            control={<Checkbox checked={selectedBrands.includes(b.tenThuongHieu)}
              onChange={e => {
                setSelectedBrands((prev: string[]) => e.target.checked ? [...prev, b.tenThuongHieu] : prev.filter((name: string) => name !== b.tenThuongHieu));
              }}/>} 
            label={b.tenThuongHieu}
          />
        ))}
      </FormGroup>
      <Divider sx={{ my: 2 }} />
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Màu sắc</Typography>
      <FormGroup>
        {Array.isArray(colors) && colors.map(c => (
          <FormControlLabel
            key={c.idMauSac}
            control={<Checkbox checked={selectedColors.includes(c.idMauSac)} onChange={e => {
              setSelectedColors((prev: number[]) => e.target.checked ? [...prev, c.idMauSac] : prev.filter((id: number) => id !== c.idMauSac));
            }} />} 
            label={c.mauSac}
          />
        ))}
      </FormGroup>
      <Divider sx={{ my: 2 }} />
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Kích cỡ</Typography>
      <FormGroup>
        {Array.isArray(sizes) && sizes.map(s => (
          <FormControlLabel
            key={s.idKichCo}
            control={<Checkbox checked={selectedSizes.includes(s.idKichCo)} onChange={e => {
              setSelectedSizes((prev: number[]) => e.target.checked ? [...prev, s.idKichCo] : prev.filter((id: number) => id !== s.idKichCo));
            }} />} 
            label={s.kichCo}
          />
        ))}
      </FormGroup>
      <Divider sx={{ my: 2 }} />
      <Button variant="outlined" color="warning" sx={{ mt: 1, fontWeight: 600 }} onClick={() => {
        setSelectedColors([]); setSelectedSizes([]); setSelectedBrands([]);
      }}>Làm mới bộ lọc</Button>
    </div>
  );
} 