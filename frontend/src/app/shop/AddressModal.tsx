import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface AddressModalProps {
  showNewAddressForm: boolean;
  setShowNewAddressForm: (v: boolean) => void;
  newAddress: any;
  setNewAddress: (v: any) => void;
  provinces: string[];
  selectedProvinceModal: any;
  selectedDistrictModal: any;
  addressError: string;
  setAddressError: (v: string) => void;
  handleSaveAddress: () => Promise<void>;
  userAddresses: any[];
  setCustomerInfo: (v: any) => void;
  setShowAddressSelect: (v: boolean) => void;
}

export default function AddressModal({ showNewAddressForm, setShowNewAddressForm, newAddress, setNewAddress, provinces, selectedProvinceModal, selectedDistrictModal, addressError, setAddressError, handleSaveAddress, userAddresses, setCustomerInfo, setShowAddressSelect }: AddressModalProps) {
  return (
    <>
      {showNewAddressForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{ p: 2, bgcolor: '#fffbe6', borderRadius: 2, boxShadow: '0 2px 8px #b59d3a22', border: '1px solid #f0e3b6', minWidth: 320, maxWidth: 420 }}>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 20, textAlign: 'center', color: '#b59d3a' }}>Thêm địa chỉ mới</Typography>
            <select required value={newAddress.thanhPho} onChange={e => setNewAddress((addr: any) => ({ ...addr, thanhPho: e.target.value, quanHuyen: '', xaPhuong: '' }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }}>
              <option value="">Tỉnh/Thành phố *</option>
              {Array.isArray(provinces) && provinces.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select required value={newAddress.quanHuyen} onChange={e => setNewAddress((addr: any) => ({ ...addr, quanHuyen: e.target.value, xaPhuong: '' }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} disabled={!newAddress.thanhPho}>
              <option value="">Quận/Huyện *</option>
              {selectedProvinceModal && selectedProvinceModal.districts.map((d: any) => <option key={d.district_name} value={d.district_name}>{d.district_name}</option>)}
            </select>
            <select required value={newAddress.xaPhuong} onChange={e => setNewAddress((addr: any) => ({ ...addr, xaPhuong: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} disabled={!newAddress.quanHuyen}>
              <option value="">Phường/Xã *</option>
              {selectedDistrictModal && selectedDistrictModal.wards.map((w: any) => <option key={w.ward_name} value={w.ward_name}>{w.ward_name}</option>)}
            </select>
            <input placeholder="Ghi chú" value={newAddress.ngoNgach} onChange={e => setNewAddress((addr: any) => ({ ...addr, ngoNgach: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" sx={{ bgcolor: '#b59d3a', color: '#fff' }} onClick={async () => await handleSaveAddress()}>
                Lưu
              </Button>
              <Button variant="outlined" onClick={() => { setShowNewAddressForm(false); setNewAddress({ thanhPho: '', quanHuyen: '', xaPhuong: '', ngoNgach: '', ghiChu: '' }); setAddressError(''); }}>Hủy</Button>
            </Box>
            {addressError && <div style={{ color: 'red', marginBottom: 8 }}>{addressError}</div>}
          </Box>
        </div>
      )}
      {/* Dialog chọn địa chỉ */}
      <Dialog open={false} onClose={() => setShowAddressSelect(false)}>
        <DialogTitle>Chọn địa chỉ</DialogTitle>
        <DialogContent>
          {userAddresses.map((addr, idx) => (
            <Button key={idx} fullWidth sx={{ mb: 1, textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => {
              setCustomerInfo((info: any) => ({
                ...info,
                city: addr.thanhPho || '',
                district: addr.quanHuyen || '',
                ward: addr.xaPhuong || '',
                address: addr.ngoNgach || ''
              }));
              setShowAddressSelect(false);
            }}>
              {addr.thanhPho}, {addr.quanHuyen}, {addr.xaPhuong}, {addr.ngoNgach} {addr.ghiChu ? `- ${addr.ghiChu}` : ''}
            </Button>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
} 