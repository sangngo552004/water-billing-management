import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

export function EditCustomerForm({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState(customer || {})

  useEffect(() => {
    setFormData(customer || {})
  }, [customer])

  if (!customer) return null

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phoneNumber ) {
      // Instead of alert, throw an error to be caught by the parent component
      throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (*).");
    }
    // No try-catch here; let the parent component handle the onSave call's errors
    console.log(customer)
    await onSave(customer.ownerId, formData);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="editFullName" className="mb-2">Họ tên *</Label>
          <Input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ tên" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="editEmail" className="mb-2">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Nhập email" />
        </div>
        <div>
          <Label htmlFor="editPhoneNumber" className="mb-2">Số điện thoại *</Label>
          <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại" />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Cập nhật</Button>
      </div>
    </div>
  )
}