import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddWaterMeterForm({ onClose, onSave, isLoading }) {
  const [serialNumber, setSerialNumber] = useState("");

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    await onSave({ serialNumber }); // Await the save operation
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="serialNumber" className="mb-2">Số Serial *</Label>
        <Input
          id="serialNumber"
          placeholder="Nhập số serial (VD: WM12345)"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          required
          disabled={isLoading} // Disable input when loading
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}