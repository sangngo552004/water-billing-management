import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFacilities } from '../../hooks/useFacilities';
import { toast } from 'sonner';

// DỮ LIỆU ĐỊA CHỈ CỐ ĐỊNH (HARDCODE)
const FIXED_ADDRESS_DATA = {
  provinces: [
    { id: "1", name: "Hồ Chí Minh" },
    { id: "2", name: "Hà Nội" },
    { id: "3", name: "Đà Nẵng" },
  ],
  districts: {
    "1": [ // Cho Hồ Chí Minh (id: "1")
      { id: "101", name: "Quận 1" },
      { id: "102", name: "Quận Bình Thạnh" },
      { id: "103", name: "Quận Tân Bình" },
    ],
    "2": [ // Cho Hà Nội (id: "2")
      { id: "201", name: "Quận Ba Đình" },
      { id: "202", name: "Quận Hoàn Kiếm" },
      { id: "203", name: "Quận Đống Đa" },
    ],
    "3": [ // Cho Đà Nẵng (id: "3")
      { id: "301", name: "Quận Hải Châu" },
      { id: "302", name: "Quận Thanh Khê" },
    ],
  },
  wards: {
    "101": [ // Cho Quận 1 (id: "101")
      { id: "10101", name: "Phường Bến Nghé" },
      { id: "10102", name: "Phường Bến Thành" },
    ],
    "102": [ // Cho Quận Bình Thạnh (id: "102")
      { id: "10201", name: "Phường 1" },
      { id: "10202", name: "Phường 2" },
    ],
    "103": [ // Cho Quận Tân Bình (id: "103")
      { id: "10301", name: "Phường 1" },
      { id: "10302", name: "Phường 2" },
    ],
    "201": [ // Cho Quận Ba Đình (id: "201")
      { id: "20101", name: "Phường Phúc Xá" },
      { id: "20102", name: "Phường Trúc Bạch" },
    ],
    "202": [ // Cho Quận Hoàn Kiếm (id: "202")
      { id: "20201", name: "Phường Hàng Buồm" },
      { id: "20202", name: "Phường Hàng Bạc" },
    ],
    "203": [ // Cho Quận Đống Đa (id: "203")
      { id: "20301", name: "Phường Cát Linh" },
      { id: "20302", name: "Phường Hàng Bột" },
    ],
    "301": [ // Cho Quận Hải Châu (id: "301")
      { id: "30101", name: "Phường Hải Châu 1" },
      { id: "30102", name: "Phường Hải Châu 2" },
    ],
    "302": [ // Cho Quận Thanh Khê (id: "302")
      { id: "30201", name: "Phường An Khê" },
      { id: "30202", name: "Phường Thanh Khê Đông" },
    ],
  },
};
// KẾT THÚC DỮ LIỆU ĐỊA CHỈ CỐ ĐỊNH

export function AddFacilityForm({ onClose }) {
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const { addFacility, loading: loadingFacilityAdd } = useFacilities();

  // Không cần loadingAddress riêng nữa vì dữ liệu cố định
  const loading = loadingFacilityAdd;

  // Lấy danh sách tỉnh/thành phố từ dữ liệu cố định
  const provinces = FIXED_ADDRESS_DATA.provinces;

  // Cập nhật districts khi province thay đổi
  useEffect(() => {
    if (selectedProvinceId) {
      setDistricts(FIXED_ADDRESS_DATA.districts[selectedProvinceId] || []);
      setSelectedDistrictId(""); // Reset district
      setSelectedWardId("");     // Reset ward
      setWards([]);              // Clear wards
    } else {
      setDistricts([]);
      setSelectedDistrictId("");
      setWards([]);
      setSelectedWardId("");
    }
  }, [selectedProvinceId]);

  // Cập nhật wards khi district thay đổi
  useEffect(() => {
    if (selectedDistrictId) {
      setWards(FIXED_ADDRESS_DATA.wards[selectedDistrictId] || []);
      setSelectedWardId(""); // Reset ward
    } else {
      setWards([]);
      setSelectedWardId("");
    }
  }, [selectedDistrictId]);


  const handleSubmit = async () => {
    if (!apartmentNumber.trim() || !selectedProvinceId || !selectedDistrictId || !selectedWardId) {
      toast.error("Vui lòng điền đầy đủ số nhà và chọn địa chỉ.");
      return;
    }

    // Lấy tên đầy đủ của tỉnh, huyện, xã từ dữ liệu cố định
    const provinceName = provinces.find(p => p.id === selectedProvinceId)?.name || '';
    const districtName = districts.find(d => d.id === selectedDistrictId)?.name || '';
    const wardName = wards.find(w => w.id === selectedWardId)?.name || '';

    // Chuẩn hóa địa chỉ: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
    const fullAddress = `${apartmentNumber.trim()}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      await addFacility(fullAddress);
      toast.success("Thêm cơ sở thành công!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra khi thêm cơ sở.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="province" className="mb-1">Tỉnh / Thành phố *</Label>
        <Select
          value={selectedProvinceId}
          onValueChange={setSelectedProvinceId}
          disabled={loading || provinces.length === 0}
        >
          <SelectTrigger id="province">
            <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="district" className="mb-1">Quận / Huyện *</Label>
        <Select
          value={selectedDistrictId}
          onValueChange={setSelectedDistrictId}
          disabled={loading || !selectedProvinceId || districts.length === 0}
        >
          <SelectTrigger id="district">
            <SelectValue placeholder="Chọn Quận / Huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="ward" className="mb-1">Phường / Xã *</Label>
        <Select
          value={selectedWardId}
          onValueChange={setSelectedWardId}
          disabled={loading || !selectedDistrictId || wards.length === 0}
        >
          <SelectTrigger id="ward">
            <SelectValue placeholder="Chọn Phường / Xã" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.id} value={ward.id}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

        <div>
        <Label htmlFor="apartmentNumber" className="mb-1">Số nhà / Tên đường / Địa chỉ cụ thể *</Label>
        <Input
          id="apartmentNumber"
          placeholder="VD: 123 Nguyễn Văn A"
          value={apartmentNumber}
          onChange={(e) => setApartmentNumber(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </div>
  );
}