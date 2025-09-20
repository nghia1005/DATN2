import React, { useEffect, useState } from 'react';

interface AddressSelectorProps {
  value: {
    city: string;
    district: string;
    ward: string;
  };
  onChange: (value: { city: string; district: string; ward: string }) => void;
  disabled?: boolean;
}

interface Province {
  name?: string;
  code?: string;
  province_id?: string;
  province_name?: string;
  districts: District[];
}
interface District {
  name?: string;
  code?: string;
  district_id?: string;
  district_name?: string;
  wards: Ward[];
}
interface Ward {
  name?: string;
  code?: string;
  ward_id?: string;
  ward_name?: string;
}

const ADDRESS_JSON_URL = '/vn-address.json';

const AddressSelector: React.FC<AddressSelectorProps> = ({ value, onChange, disabled }) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    setLoading(true);
    fetch(ADDRESS_JSON_URL)
      .then(res => res.json())
      .then((data) => {
        setProvinces(Array.isArray(data) ? data : (data.results || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Update districts when city (province_id) changes
  useEffect(() => {
    if (!value.city) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const province = provinces.find(
      p => p.province_id === value.city || p.name === value.city || p.province_name === value.city || p.code === value.city
    );
    if (province) {
      setDistricts(province.districts);
    } else {
      setDistricts([]);
    }
    setWards([]);
  }, [value.city, provinces]);

  // Update wards when district (district_id) changes
  useEffect(() => {
    if (!value.district) {
      setWards([]);
      return;
    }
    const district = districts.find(
      d => d.district_id === value.district || d.name === value.district || d.district_name === value.district || d.code === value.district
    );
    if (district) {
      setWards(district.wards);
    } else {
      setWards([]);
    }
  }, [value.district, districts]);

  useEffect(() => {
    console.log('AddressSelector value:', value);
    console.log('provinces:', provinces.map(p => p.province_id || p.code));
    console.log('districts:', districts.map(d => d.district_id || d.code));
    console.log('wards:', wards.map(w => w.ward_id || w.code));
  }, [value, provinces, districts, wards]);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Tỉnh/Thành phố</label>
        <select
          disabled={disabled || loading}
          value={value.city}
          onChange={e => onChange({ city: e.target.value, district: '', ward: '' })}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map((p, idx) => (
            <option key={p.province_id || p.code || idx} value={p.province_id || p.code || ''}>
              {p.province_name || p.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Quận/Huyện</label>
        <select
          disabled={disabled || !value.city || loading}
          value={value.district}
          onChange={e => onChange({ city: value.city, district: e.target.value, ward: '' })}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map((d, idx) => (
            <option key={d.district_id || d.code || idx} value={d.district_id || d.code || ''}>
              {d.district_name || d.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Phường/Xã</label>
        <select
          disabled={disabled || !value.district || loading}
          value={value.ward}
          onChange={e => onChange({ city: value.city, district: value.district, ward: e.target.value })}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map((w, idx) => (
            <option key={w.ward_id || w.code || idx} value={w.ward_id || w.code || ''}>
              {w.ward_name || w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressSelector; 