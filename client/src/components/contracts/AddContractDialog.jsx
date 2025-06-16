import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { toast } from "sonner"; // Bạn đã import toast, có thể dùng để hiển thị thông báo
import { uploadImageToCloudinary } from "../../utils/uploadImage"; 

// Đảm bảo đường dẫn import đúng cho các hàm API
import { getCustomers, getFacilities } from "../../api/contract";
import { getContractTypes } from "../../api/contractType";

export default function AddContractDialog({ isOpen, onClose, onSave }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedContractTypeId, setSelectedContractTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [availableContractTypes, setAvailableContractTypes] = useState([]);
  const [imageFile, setImageFile] = useState(null); // Đổi tên để rõ ràng đây là File object
  const [imageUrl, setImageUrl] = useState(''); // Để lưu trữ URL sau khi tải lên
  const [uploadingImage, setUploadingImage] = useState(false); // Trạng thái tải ảnh lên

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const customerData = await getCustomers("");
        setCustomers(customerData);
        const facilityData = await getFacilities("");
        setFacilities(facilityData);

        const typeData = await getContractTypes();
        setAvailableContractTypes(typeData);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu dropdown.");
        console.error("Fetch dropdown data error:", error);
      }
    };
    if (isOpen) {
      fetchDropdownData();
      // Reset form khi mở
      setSelectedCustomer(null);
      setSelectedFacility(null);
      setSelectedContractTypeId("");
      setStartDate("");
      setIsActive(true);
      setCustomerSearch("");
      setFacilitySearch("");
      setImageFile(null); // Reset file ảnh
      setImageUrl(''); // Reset URL ảnh
      setUploadingImage(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerSearch.length > 2 || customerSearch.length === 0) {
        try {
          const data = await getCustomers(customerSearch);
          setCustomers(data);
        } catch (error) {
          toast.error("Lỗi khi tìm kiếm khách hàng.");
          console.error("Customer search error:", error);
        }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (facilitySearch.length > 2 || facilitySearch.length === 0) {
        try {
          const data = await getFacilities(facilitySearch);
          setFacilities(data);
        } catch (error) {
          toast.error("Lỗi khi tìm kiếm cơ sở.");
          console.error("Facility search error:", error);
        }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [facilitySearch]);

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImageFile(file); // Cập nhật state với một File object duy nhất
    setImageUrl(''); // Xóa URL cũ nếu người dùng chọn ảnh mới
    setError(null); // Xóa lỗi cũ
  };

  const handleSubmit = async () => {
    // Kiểm tra các trường bắt buộc
    if (!selectedCustomer || !selectedFacility || !selectedContractTypeId || !startDate) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    let finalImageUrl = null;

    if (imageFile) {
      setUploadingImage(true); // Bắt đầu quá trình tải ảnh
      try {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
        setImageUrl(finalImageUrl); // Lưu URL vào state nếu muốn hiển thị ngay
      } catch (error) {
        console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
        setUploadingImage(false); // Dừng loading ngay cả khi lỗi
        return; // Dừng hàm nếu tải ảnh thất bại
      } finally {
        setUploadingImage(false); // Dừng loading
      }
    }


    onSave({
      customerId: selectedCustomer.ownerId,
      facilityId: selectedFacility.facilityId,
      contractTypeId: selectedContractTypeId,
      startDate,
      isActive,
      imageUrl: finalImageUrl, // Truyền URL ảnh đã tải lên
    });

    onClose(); // Đóng dialog sau khi lưu
  };

  const displayContractTypeName = availableContractTypes.find(
    (type) => type.id === selectedContractTypeId
  )?.name || "Chọn loại hợp đồng";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thêm hợp đồng mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customerSearch">Khách hàng *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="customerSearch"
                placeholder="Tìm kiếm khách hàng..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 mt-2 border rounded-md p-1">
              {customers.length === 0 ? (
                <div className="text-center text-gray-500 py-2">Không tìm thấy khách hàng.</div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.ownerId}
                    className={`p-2 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedCustomer?.ownerId === customer.ownerId ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="font-medium text-sm">
                      {customer.ownerId} - {customer.fullName}
                    </div>
                    <div className="text-xs text-gray-600">{customer.phone}</div>
                  </div>
                ))
              )}
            </div>
            {selectedCustomer && (
              <p className="mt-2 text-sm text-green-600">Đã chọn: {selectedCustomer.fullName} ({selectedCustomer.ownerId})</p>
            )}
          </div>

          {/* Facility Selection */}
          <div>
            <Label htmlFor="facilitySearch">Cơ sở *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="facilitySearch"
                placeholder="Tìm kiếm cơ sở..."
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 mt-2 border rounded-md p-1">
              {facilities.length === 0 ? (
                <div className="text-center text-gray-500 py-2">Không tìm thấy cơ sở.</div>
              ) : (
                facilities.map((facility) => (
                  <div
                    key={facility.facilityId}
                    className={`p-2 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedFacility?.facilityId === facility.facilityId ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <div className="text-sm">{facility.fullAddress}</div>
                  </div>
                ))
              )}
            </div>
            {selectedFacility && (
              <p className="mt-2 text-sm text-green-600">Đã chọn: {selectedFacility.fullAddress}</p>
            )}
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractType">Loại hợp đồng *</Label>
              <Select value={selectedContractTypeId} onValueChange={setSelectedContractTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hợp đồng">{displayContractTypeName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableContractTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="contractImage">Ảnh hợp đồng</Label>
            <Input
              id="contractImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {imageFile ? `Đã chọn: ${imageFile.name}` : "Chưa có ảnh được chọn."}
            </p>
            {imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-600">Ảnh đã tải lên:</p>
                <img src={imageUrl} alt="Ảnh hợp đồng" className="max-w-[150px] h-auto rounded-md border" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedCustomer ||
                !selectedFacility ||
                !selectedContractTypeId ||
                !startDate ||
                uploadingImage // Vô hiệu hóa khi đang tải ảnh
              }
            >
              {uploadingImage ? 'Đang tải ảnh...' : 'Lưu hợp đồng'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}