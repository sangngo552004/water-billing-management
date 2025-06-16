// src/components/contract-types/EditContractTypeDialog.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditContractTypeDialog({ type, onClose, onSave }) {
  const [typeName, setTypeName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (type) {
      setTypeName(type.name);
      setDescription(type.description || "");
    }
  }, [type]);

  const handleSubmit = () => {
    if (!typeName.trim()) {
      alert("Tên loại hợp đồng không được để trống.");
      return;
    }
    onSave(type.id, { newTypeName: typeName, description: description });
    onClose();
  };

  if (!type) return null;

  return (
    <Dialog open={!!type} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa loại hợp đồng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="editTypeName">Tên loại hợp đồng *</Label>
            <Input
              id="editTypeName"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="VD: Hộ gia đình, Thương mại"
            />
          </div>
          <div>
            <Label htmlFor="editDescription">Mô tả</Label>
            <Input
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về loại hợp đồng này"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Lưu thay đổi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}