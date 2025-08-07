import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';


interface CheckoutFormProps {
  customerInfo: any;
  setCustomerInfo: (v: any) => void;
  userAddresses: any[];
  setShowAddressSelect: (v: boolean) => void;
  setShowNewAddressForm: (v: boolean) => void;
  showNewAddressForm: boolean;
  addressError: string;
  setAddressError: (v: string) => void;
  vouchers: { code: string; label: string }[];
  provinces: string[];
  districts: string[];
  wards: string[];
  selectedProvince: any;
  selectedDistrict: any;
  setNewAddress: (v: any) => void;
  newAddress: any;
  handleCreateInvoice: () => void;
  userRole: 'NHAN_VIEN' | 'KHACH_HANG' | null;
  handleAutoFillCustomerInfo: () => void;

}

export default function CheckoutForm({ customerInfo, setCustomerInfo, userAddresses, setShowAddressSelect, setShowNewAddressForm, showNewAddressForm, addressError, setAddressError, vouchers, provinces, districts, wards, selectedProvince, selectedDistrict, setNewAddress, newAddress, handleCreateInvoice, userRole, handleAutoFillCustomerInfo }: CheckoutFormProps) {
  // State cho dữ liệu địa chỉ động
  const [addressData, setAddressData] = useState<any[]>([]);
  const [provinceList, setProvinceList] = useState<string[]>([]);
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [wardList, setWardList] = useState<string[]>([]);

  // Load dữ liệu địa chỉ từ file JSON
  useEffect(() => {
    fetch('/vn-address.json')
      .then(res => res.json())
      .then(data => {
        console.log('DATA FETCHED:', data);
        if (data && Array.isArray(data.results)) {
          setAddressData(data.results);
          setProvinceList(data.results.map((p: any) => p.province_name));
        } else {
          console.error('vn-address.json không đúng định dạng!');
          setAddressData([]);
          setProvinceList([]);
        }
      })
      .catch(err => {
        console.error('Lỗi khi fetch vn-address.json:', err);
        setAddressData([]);
        setProvinceList([]);
      });
  }, []);

  // Theo dõi thay đổi của customerInfo.city và cập nhật districts
  useEffect(() => {
    console.log('useEffect city changed:', customerInfo.city, 'addressData length:', addressData.length);
    if (customerInfo.city && addressData.length > 0) {
      const province = addressData.find((p: any) => p.province_name === customerInfo.city);
      console.log('Found province:', province);
      if (province) {
        const districts = province.districts.map((d: any) => d.district_name);
        console.log('Setting districts:', districts);
        setDistrictList(districts);
      } else {
        console.log('Province not found, clearing districts');
        setDistrictList([]);
      }
      setWardList([]);
    }
  }, [customerInfo.city, addressData]);

  // Theo dõi thay đổi của customerInfo.district và cập nhật wards
  useEffect(() => {
    console.log('useEffect district changed:', customerInfo.district, 'city:', customerInfo.city);
    if (customerInfo.district && customerInfo.city && addressData.length > 0) {
      const province = addressData.find((p: any) => p.province_name === customerInfo.city);
      if (province) {
        const district = province.districts.find((d: any) => d.district_name === customerInfo.district);
        console.log('Found district:', district);
        if (district) {
          const wards = district.wards.map((w: any) => w.ward_name);
          console.log('Setting wards:', wards);
          setWardList(wards);
        } else {
          console.log('District not found, clearing wards');
          setWardList([]);
        }
      }
    }
  }, [customerInfo.district, customerInfo.city, addressData]);

  // Khi chọn tỉnh/thành phố
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    setCustomerInfo((info: any) => ({ ...info, city: provinceName, district: '', ward: '' }));
  };

  // Khi chọn quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    setCustomerInfo((info: any) => ({ ...info, district: districtName, ward: '' }));
  };

  // Khi chọn phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.value;
    setCustomerInfo((info: any) => ({ ...info, ward: wardName }));
  };

  return (
    <Box sx={{ flex: 1.2, pr: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>THÔNG TIN KHÁCH HÀNG</Typography>
      <form onSubmit={e => { e.preventDefault(); }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Họ tên</label>
            <input required placeholder="Họ tên" value={customerInfo.name} onChange={e => setCustomerInfo((info: any) => ({ ...info, name: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Số điện thoại</label>
            <input required placeholder="Số điện thoại" value={customerInfo.phone} onChange={e => setCustomerInfo((info: any) => ({ ...info, phone: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} />
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input 
            type="email" 
            required 
            placeholder="Email (vd: example@gmail.com)" 
            value={customerInfo.email} 
            onChange={e => setCustomerInfo((info: any) => ({ ...info, email: e.target.value }))} 
            style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email) ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: 4 
            }} 
          />
          {customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email) && (
            <Typography variant="caption" sx={{ color: '#f44336', fontSize: '0.75rem' }}>
              Email không hợp lệ. Vui lòng nhập email đúng định dạng.
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Tỉnh/Thành phố</label>
            <select required value={customerInfo.city || ''} onChange={handleProvinceChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }}>
              <option value="">Chọn Tỉnh/Thành</option>
              {provinceList.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Quận/Huyện</label>
            <select required value={customerInfo.district || ''} onChange={handleDistrictChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} disabled={!customerInfo.city}>
              <option value="">Chọn Quận/Huyện</option>
              {districtList.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Phường/Xã</label>
            <select required value={customerInfo.ward || ''} onChange={handleWardChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} disabled={!customerInfo.district}>
              <option value="">Chọn Phường/Xã</option>
              {wardList.map((w: string) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Địa chỉ cụ thể</label>
          <input placeholder="Địa chỉ cụ thể" value={customerInfo.address || ''} onChange={e => setCustomerInfo((info: any) => ({ ...info, address: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} />
        </Box>
        

        {/* Dropdown chọn địa chỉ khách hàng */}
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Chọn địa chỉ đã lưu</label>
          <select 
            onChange={(e) => {
              const selectedAddress = userAddresses[parseInt(e.target.value)];
              if (selectedAddress) {
                console.log('Chọn địa chỉ:', selectedAddress);
                
                // Cập nhật customerInfo với thông tin địa chỉ và giữ nguyên email
                setCustomerInfo((info: any) => ({
                  ...info,
                  city: selectedAddress.thanhPho || '',
                  district: selectedAddress.quanHuyen || '',
                  ward: selectedAddress.xaPhuong || '',
                  address: selectedAddress.ngoNgach || '',
                  // Giữ nguyên email nếu đã có, hoặc lấy từ thông tin khách hàng
                  email: info.email || selectedAddress.email || '',
                }));
              }
            }}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }}
          >
            <option value="">Chọn địa chỉ đã lưu</option>
            {userAddresses && userAddresses.length > 0 ? (
              userAddresses.map((addr, index) => (
                <option key={index} value={index}>
                  {addr.thanhPho}, {addr.quanHuyen}, {addr.xaPhuong}, {addr.ngoNgach} {addr.ghiChu ? `- ${addr.ghiChu}` : ''}
                </option>
              ))
            ) : (
              <option value="" disabled>Chưa có địa chỉ nào được lưu</option>
            )}
          </select>

        </Box>
        {/* Có thể thêm các trường trạng thái giao hàng, ghi chú nếu muốn */}
        {/* <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Trạng thái giao hàng</label>
          <select style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }}>
            <option value="">Chọn trạng thái giao hàng</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DANG_GIAO">Đang giao</option>
            <option value="DA_GIAO">Đã giao</option>
          </select>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Ghi chú cho người vận chuyển</label>
          <input placeholder="Ghi chú cho người vận chuyển" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} />
        </Box> */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="outlined" onClick={handleAutoFillCustomerInfo} sx={{ flex: 1, color: '#388e3c', borderColor: '#388e3c', fontWeight: 700 }}>
            Tự động điền thông tin khách hàng
          </Button>
          <Button variant="contained" onClick={() => setShowNewAddressForm(true)} sx={{ flex: 1, background: '#1976d2', color: '#fff', fontWeight: 700 }}>
            Tạo địa chỉ mới
          </Button>
        </Box>
        {addressError && <Typography color="error" sx={{ mb: 1 }}>{addressError}</Typography>}
        {/* Danh sách địa chỉ */}
        {userAddresses && userAddresses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Danh sách địa chỉ:</Typography>
            <ul style={{ paddingLeft: 18 }}>
              {userAddresses.map((addr, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  {addr.thanhPho}, {addr.quanHuyen}, {addr.xaPhuong}, {addr.ngoNgach} {addr.ghiChu ? `- ${addr.ghiChu}` : ''}
                </li>
              ))}
            </ul>
          </Box>
        )}
      </form>
    </Box>
  );
} 