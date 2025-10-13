import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIOD_FILTER_DATA } from "@/hooks/usePeriods"; // Import dữ liệu lọc/trạng thái

function PeriodForm({ initialData, onClose, onSubmit }) {
  const [name, setName] = useState(initialData?.periodName || "");
  const [toDate, setToDate] = useState(initialData?.toDate || "");
  // Giả định trạng thái ban đầu khi tạo mới, hoặc từ dữ liệu chỉnh sửa


  useEffect(() => {
    if (initialData) {
      setName(initialData.periodName || "");
      setToDate(initialData.toDate || "");
    } else {
      // Reset form khi thêm mới
      setName("");
      setToDate("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !toDate) {
      alert("Vui lòng điền đầy đủ các trường: Tên kỳ, Từ ngày, Đến ngày.");
      return;
    }
    const formData = {
        id: initialData?.periodId || null,
      name,
      toDate,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className='mb-2'>Tên kỳ</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: 07/2025"
          required
        />
      </div>
      <div>
        <Label htmlFor="toDate" className='mb-2'>Đến ngày</Label>
        <Input
          id="toDate"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} type="button">
          Hủy
        </Button>
        <Button type="submit">{initialData ? "Cập nhật" : "Thêm"}</Button>
      </div>
    </form>
  );
}

export default PeriodForm;