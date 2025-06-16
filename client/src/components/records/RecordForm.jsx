import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Loader2 } from "lucide-react";

// Import hàm uploadImageToCloudinary từ utils/
import { uploadImageToCloudinary } from "../../utils/uploadImage";

export const RecordForm = ({ contract, onSave, onCancel }) => {
  console.log(contract);
  const [formData, setFormData] = useState(
    // Giữ nguyên cách khởi tạo từ 'contract?.meters' theo mã bạn đã cung cấp gần nhất
    
    contract?.meters.map((assignment) => ({
      waterMeterId: assignment.waterMeterId,
      oldReading: assignment.oldReading,
      serialNumber: assignment.serialNumber,
      assignmentId: assignment.assignmentId, 
      newReading: "",
      note: "", // Đảm bảo trường note có trong formData
      imageUrl: null, // URL ảnh riêng cho từng đồng hồ
      isUploadingImage: false, // Trạng thái tải ảnh riêng cho từng đồng hồ
    })) || [],
  );

  const handleImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newFormData = [...formData];
      // Đặt trạng thái tải và xóa URL cũ cho đồng hồ cụ thể
      newFormData[index] = { ...newFormData[index], isUploadingImage: true, imageUrl: null };
      setFormData(newFormData);

      try {
        const result = await uploadImageToCloudinary(file); // Gọi hàm tải ảnh của bạn
        if (result.success) {
          // Cập nhật URL ảnh và trạng thái tải cho đồng hồ cụ thể
          newFormData[index] = { ...newFormData[index], imageUrl: result.url, isUploadingImage: false };
          setFormData(newFormData);
        } else {
          console.error("Lỗi khi tải ảnh lên Cloudinary:", result.error);
          // Đặt lại trạng thái lỗi và URL ảnh cho đồng hồ cụ thể
          newFormData[index] = { ...newFormData[index], isUploadingImage: false, imageUrl: null };
          setFormData(newFormData);
          // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        }
      } catch (error) {
        console.error("Lỗi mạng hoặc lỗi không xác định khi tải ảnh:", error);
        // Đặt lại trạng thái lỗi và URL ảnh cho đồng hồ cụ thể
        newFormData[index] = { ...newFormData[index], isUploadingImage: false, imageUrl: null };
        setFormData(newFormData);
      }
    }
  };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    // Chuyển đổi newReading sang số thập phân (decimal)
    if (field === "newReading") {
      const parsedValue = parseFloat(value);
      // Kiểm tra nếu giá trị hợp lệ (không phải NaN) thì lưu số, ngược lại lưu chuỗi rỗng
      newFormData[index] = { ...newFormData[index], [field]: isNaN(parsedValue) ? "" : parsedValue };
    } else {
      newFormData[index] = { ...newFormData[index], [field]: value };
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  for (const meterData of formData) {
    if (meterData.newReading) {
      await onSave({
        serialNumber: meterData.serialNumber,
        waterMeterId: meterData.waterMeterId,
        assignmentId: meterData.assignmentId,
        newReading: meterData.newReading,
        imageUrl: meterData.imageUrl,
      });
    }
  }

  onCancel(); 
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Số seri đồng hồ</TableHead>
            <TableHead>Chỉ số cũ</TableHead>
            <TableHead>Nhập chỉ số mới</TableHead>
            <TableHead>Hình ảnh</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formData.map((meter, index) => (
            <TableRow key={meter.waterMeterId}> {/* Đã sửa: Sử dụng meter.waterMeterId làm key */}
              <TableCell>{meter.serialNumber}</TableCell>
              <TableCell>{meter.oldReading}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={meter.newReading}
                  onChange={(e) => handleInputChange(index, "newReading", e.target.value)}
                  placeholder="Nhập chỉ số mới"
                  required
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)} // Truyền index để cập nhật đúng hàng
                    className="hidden"
                    id={`image-upload-${index}`}
                    disabled={meter.isUploadingImage}
                  />
                  <Label htmlFor={`image-upload-${index}`} className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={meter.isUploadingImage}>
                      <span>
                        {meter.isUploadingImage ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {meter.isUploadingImage ? "Đang tải..." : "Chọn ảnh"}
                      </span>
                    </Button>
                  </Label>
                  {meter.imageUrl && (
                    <a href={meter.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                      Ảnh đã tải lên
                    </a>
                  )}
                </div>
              </TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Lưu tất cả
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
};