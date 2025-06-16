// src/components/contract-types/EditPriceFormDialog.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export default function EditPriceFormDialog({ contractTypeId, onClose, onSave, allPricingTiers }) {
  const [tiers, setTiers] = useState([]);
  const [typeName, setTypeName] = useState("");

  useEffect(() => {
    if (contractTypeId) {

      const currentTiers = allPricingTiers.filter(tier => tier.contractTypeId === contractTypeId);

      const grouped = currentTiers.reduce((acc, tier) => {
        if (!acc[tier.groupId] || acc[tier.groupId][0].createdAt < tier.createdAt) {
          acc[tier.groupId] = [tier];
        } else {
          acc[tier.groupId].push(tier);
        }
        return acc;
      }, {});

      // Find the currently active group (or the latest created one)
      const activeGroup = Object.values(grouped).find(group => group[0].isActive);
      const latestGroup = Object.values(grouped).sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime())[0];

      setTiers(activeGroup ? activeGroup.sort((a, b) => a.minUsage - b.minUsage) : (latestGroup ? latestGroup.sort((a, b) => a.minUsage - b.minUsage) : [{ minUsage: "", maxUsage: "", pricePerM3: "" }]));

      // Optionally, set the type name for display (you might need to pass contractTypes to this component)
      // For now, let's assume you have a way to get the type name
      // setTypeName(contractTypes.find(t => t.id === contractTypeId)?.name || "Loại hợp đồng");
    }
  }, [contractTypeId, allPricingTiers]);

  const handleAddTier = () => {
    setTiers([...tiers, { minUsage: "", maxUsage: "", pricePerM3: "" }]);
  };

  const handleRemoveTier = (index) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value === "" ? null : Number(value); // Convert to number or null
    setTiers(newTiers);
  };

  const handleSubmit = () => {
    const isValidTiers = tiers.every(tier => {
      const min = tier.minUsage;
      const max = tier.maxUsage;
      const price = tier.pricePerM3;

      return (
        min !== null &&
        min >= 0 &&
        price !== null &&
        price > 0 &&
        (max === null || (max > min && max > 0))
      );
    });

    if (!isValidTiers) {
      alert("Vui lòng nhập đầy đủ và chính xác thông tin tầng giá (Từ, Đến, Giá). Giá phải lớn hơn 0. Từ phải nhỏ hơn Đến nếu có.");
      return;
    }

    onSave(contractTypeId, tiers.map(tier => ({
      ...tier,
      // Ensure maxUsage is null if empty string or 0
      maxUsage: tier.maxUsage === 0 || tier.maxUsage === "" ? null : tier.maxUsage,
    })));
    onClose();
  };

  if (!contractTypeId) return null;

  return (
    <Dialog open={!!contractTypeId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tầng giá {typeName && `cho "${typeName}"`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tầng giá hiện tại</h3>
          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div key={index} className="flex items-end gap-2 border p-3 rounded-md">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`minUsage-${index}`}>Từ (m³) *</Label>
                    <Input
                      id={`minUsage-${index}`}
                      type="number"
                      value={tier.minUsage === null ? "" : tier.minUsage}
                      onChange={(e) => handleTierChange(index, "minUsage", e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`maxUsage-${index}`}>Đến (m³)</Label>
                    <Input
                      id={`maxUsage-${index}`}
                      type="number"
                      value={tier.maxUsage === null ? "" : tier.maxUsage}
                      onChange={(e) => handleTierChange(index, "maxUsage", e.target.value)}
                      placeholder="Để trống nếu vô hạn"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pricePerM3-${index}`}>Giá (VND/m³) *</Label>
                    <Input
                      id={`pricePerM3-${index}`}
                      type="number"
                      value={tier.pricePerM3 === null ? "" : tier.pricePerM3}
                      onChange={(e) => handleTierChange(index, "pricePerM3", e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveTier(index)}
                  className="text-red-600"
                  disabled={tiers.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddTier} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Thêm tầng giá
            </Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Cập nhật giá</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}