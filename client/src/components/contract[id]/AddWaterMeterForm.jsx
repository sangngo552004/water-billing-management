import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Keep Input for potential manual entry or if serial is also needed
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Import Select components

export default function AddWaterMeterForm({ onClose, onSubmit, availableWaterMeters }) {
  const [selectedMeterId, setSelectedMeterId] = useState("")
  const [selectedMeterSerialNumber, setSelectedMeterSerialNumber] = useState("")
  const [loadingAvailableMeters, setLoadingAvailableMeters] = useState(false); // To indicate loading state of dropdown

  // Find the selected meter object to get its serial number if only ID is stored
  useEffect(() => {
    if (selectedMeterId && availableWaterMeters) {
      const meter = availableWaterMeters.find(m => m.waterMeterId === selectedMeterId);
      if (meter) {
        setSelectedMeterSerialNumber(meter.serialNumber);
      }
    } else {
      setSelectedMeterSerialNumber(""); // Clear if no meter selected
    }
  }, [selectedMeterId, availableWaterMeters]);

  const handleSubmit = () => {
    if (selectedMeterId && selectedMeterSerialNumber.trim()) {
      onSubmit(selectedMeterSerialNumber.trim(), selectedMeterId)
    } else {
      // Optionally show an error if no meter is selected
      alert("Vui lòng chọn một đồng hồ nước.");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="waterMeterSelect" className="mb-2">Chọn đồng hồ nước *</Label>
        <Select onValueChange={setSelectedMeterId} value={selectedMeterId} disabled={loadingAvailableMeters || !availableWaterMeters || availableWaterMeters.length === 0}>
          <SelectTrigger className="w-full" id="waterMeterSelect">
            <SelectValue placeholder={loadingAvailableMeters ? "Đang tải đồng hồ..." : "Chọn một đồng hồ nước"} />
          </SelectTrigger>
          <SelectContent>
            {availableWaterMeters && availableWaterMeters.length > 0 ? (
              availableWaterMeters.map((meter) => (
                <SelectItem key={meter.waterMeterId} value={meter.waterMeterId}>
                  {meter.serialNumber} (ID: {meter.waterMeterId})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-meters" disabled>Không có đồng hồ nào khả dụng</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedMeterSerialNumber && (
        <div>
          <Label>Serial đã chọn</Label>
          <Input value={selectedMeterSerialNumber} readOnly disabled />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedMeterId}>Lưu</Button>
      </div>
    </div>
  )
}