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
  customerFormError: string;
  setCustomerFormError: (v: string) => void;
  fieldErrors: any;
  setFieldErrors: (v: any) => void;
}

export default function CheckoutForm({ customerInfo, setCustomerInfo, userAddresses, setShowAddressSelect, setShowNewAddressForm, showNewAddressForm, addressError, setAddressError, vouchers, provinces, districts, wards, selectedProvince, selectedDistrict, setNewAddress, newAddress, handleCreateInvoice, userRole, handleAutoFillCustomerInfo, customerFormError, setCustomerFormError, fieldErrors, setFieldErrors }: CheckoutFormProps) {
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
    if (customerFormError) setCustomerFormError('');
    if (fieldErrors.city) setFieldErrors((prev: any) => ({ ...prev, city: '' }));
  };

  // Khi chọn quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    setCustomerInfo((info: any) => ({ ...info, district: districtName, ward: '' }));
    if (customerFormError) setCustomerFormError('');
    if (fieldErrors.district) setFieldErrors((prev: any) => ({ ...prev, district: '' }));
  };

  // Khi chọn phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.value;
    setCustomerInfo((info: any) => ({ ...info, ward: wardName }));
    if (customerFormError) setCustomerFormError('');
    if (fieldErrors.ward) setFieldErrors((prev: any) => ({ ...prev, ward: '' }));
  };

  return (
    <Box sx={{ flex: 1.2, pr: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>THÔNG TIN KHÁCH HÀNG</Typography>
      
      {/* Hiển thị lỗi validation */}
      {customerFormError && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
            ⚠️ {customerFormError}
          </Typography>
        </Box>
      )}
      
      <form onSubmit={e => { e.preventDefault(); }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Tên người nhận *</label>
            <input required placeholder="Tên người nhận" value={customerInfo.name} onChange={e => {
              setCustomerInfo((info: any) => ({ ...info, name: e.target.value }));
              if (customerFormError) setCustomerFormError('');
              if (fieldErrors.name) setFieldErrors((prev: any) => ({ ...prev, name: '' }));
            }} style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.name ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: fieldErrors.name ? 4 : 12 
            }} />
            {fieldErrors.name && (
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
                {fieldErrors.name}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Số điện thoại *</label>
            <input required placeholder="Số điện thoại" value={customerInfo.phone} onChange={e => {
              setCustomerInfo((info: any) => ({ ...info, phone: e.target.value }));
              if (customerFormError) setCustomerFormError('');
              if (fieldErrors.phone) setFieldErrors((prev: any) => ({ ...prev, phone: '' }));
            }} style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.phone ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: fieldErrors.phone ? 4 : 12 
            }} />
            {fieldErrors.phone && (
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
                {fieldErrors.phone}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input 
            type="email" 
            required 
            placeholder="Email (vd: example@gmail.com)" 
            value={customerInfo.email} 
            onChange={e => {
              setCustomerInfo((info: any) => ({ ...info, email: e.target.value }));
              if (customerFormError) setCustomerFormError('');
              if (fieldErrors.email) setFieldErrors((prev: any) => ({ ...prev, email: '' }));
            }} 
            style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.email ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: 4 
            }} 
          />
          {fieldErrors.email && (
            <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
              {fieldErrors.email}
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Tỉnh/Thành phố *</label>
            <select required value={customerInfo.city || ''} onChange={handleProvinceChange} style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.city ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: fieldErrors.city ? 4 : 12 
            }}>
              <option value="">-- Chọn tỉnh/thành --</option>
              {provinceList.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>
            {fieldErrors.city && (
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
                {fieldErrors.city}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Quận/Huyện *</label>
            <select required value={customerInfo.district || ''} onChange={handleDistrictChange} style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.district ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: fieldErrors.district ? 4 : 12 
            }} disabled={!customerInfo.city}>
              <option value="">-- Chọn quận/huyện --</option>
              {districtList.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
            {fieldErrors.district && (
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
                {fieldErrors.district}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Phường/Xã *</label>
            <select required value={customerInfo.ward || ''} onChange={handleWardChange} style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 6, 
              border: fieldErrors.ward ? '1px solid #f44336' : '1px solid #ccc', 
              fontSize: 16, 
              marginBottom: fieldErrors.ward ? 4 : 12 
            }} disabled={!customerInfo.district}>
              <option value="">-- Chọn phường/xã --</option>
              {wardList.map((w: string) => <option key={w} value={w}>{w}</option>)}
            </select>
            {fieldErrors.ward && (
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
                {fieldErrors.ward}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontWeight: 600 }}>Địa chỉ chi tiết (có thể bỏ trống)</label>
          <input placeholder="Địa chỉ chi tiết" value={customerInfo.address || ''} onChange={e => {
            setCustomerInfo((info: any) => ({ ...info, address: e.target.value }));
            if (customerFormError) setCustomerFormError('');
            if (fieldErrors.address) setFieldErrors((prev: any) => ({ ...prev, address: '' }));
          }} style={{ 
            width: '100%', 
            padding: 10, 
            borderRadius: 6, 
            border: fieldErrors.address ? '1px solid #f44336' : '1px solid #ccc', 
            fontSize: 16, 
            marginBottom: fieldErrors.address ? 4 : 12 
          }} />
          {fieldErrors.address && (
            <Typography variant="body2" sx={{ color: '#f44336', fontSize: 12, mb: 1 }}>
              {fieldErrors.address}
            </Typography>
          )}
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