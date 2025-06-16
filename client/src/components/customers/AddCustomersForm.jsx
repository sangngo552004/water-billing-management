import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function AddCustomerForm({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: "",
    identityNumber: "",
    email: "",
    phoneNumber: "",
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.fullName || !formData.identityNumber || !formData.phoneNumber || !formData.email) {
      // Instead of alert, throw an error to be caught by the parent component
      throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (*).");
    }
    // No try-catch here; let the parent component handle the onSave call's errors
    await onSave(formData);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName" className="mb-2">Họ tên *</Label>
          <Input id="fullName" placeholder="Nhập họ tên" value={formData.fullName} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="identityNumber" className="mb-2">CMND/CCCD *</Label>
          <Input id="identityNumber" placeholder="Nhập số CMND/CCCD" value={formData.identityNumber} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="mb-2">Email</Label>
          <Input id="email" type="email" placeholder="Nhập email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="mb-2">Số điện thoại *</Label>
          <Input id="phoneNumber" placeholder="Nhập số điện thoại" value={formData.phoneNumber} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Lưu</Button>
      </div>
    </div>
  )
}