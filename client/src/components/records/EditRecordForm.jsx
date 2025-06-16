import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export const EditRecordForm = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    newReading: record.newReading,
    image: record.image,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(record.id, formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newReading">Chỉ số mới</Label>
        <Input
          id="newReading"
          type="number"
          value={formData.newReading}
          onChange={(e) => setFormData({ ...formData, newReading: Number.parseInt(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Hình ảnh</Label>
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-edit" />
          <Label htmlFor="image-edit" className="cursor-pointer">
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Chọn ảnh mới
              </span>
            </Button>
          </Label>
          {formData.image && (
            <span className="text-sm text-green-600">
              {typeof formData.image === "string" ? "Có ảnh" : formData.image.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Lưu
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
};