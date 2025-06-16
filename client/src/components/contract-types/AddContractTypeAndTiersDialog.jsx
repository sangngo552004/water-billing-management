import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export default function AddContractTypeAndTiersDialog({ isOpen, onClose, onSave }) {
  const [typeName, setTypeName] = useState("");
  const [description, setDescription] = useState("");
  // Khởi tạo với minUsage 0 và maxUsage null cho tầng đầu tiên
  const [pricingTiers, setPricingTiers] = useState([{ minUsage: 0, maxUsage: null, pricePerM3: "" }]);

  // Effect để đảm bảo tầng cuối cùng luôn có maxUsage: null (vô hạn)
  useEffect(() => {
    if (pricingTiers.length > 0) {
      setPricingTiers(prevTiers => {
        const lastTierIndex = prevTiers.length - 1;
        // Chỉ cập nhật nếu tầng cuối cùng hiện tại không phải là null
        if (prevTiers[lastTierIndex].maxUsage !== null) {
          const newTiers = [...prevTiers];
          newTiers[lastTierIndex] = { ...newTiers[lastTierIndex], maxUsage: null };
          return newTiers;
        }
        return prevTiers;
      });
    }
  }, [pricingTiers.length]); // Chạy lại khi số lượng tầng thay đổi

  const handleAddTier = () => {
    setPricingTiers(prevTiers => {
      const lastTier = prevTiers[prevTiers.length - 1];
      let newMinUsage = 0;

      // Nếu có tầng trước và maxUsage của nó không phải là null,
      // thì minUsage của tầng mới sẽ bằng maxUsage của tầng trước.
      if (lastTier && lastTier.maxUsage !== null) {
        newMinUsage = lastTier.maxUsage;
      } else if (lastTier && lastTier.minUsage !== null) {
        // Nếu maxUsage của tầng cuối cùng là null,
        // thì minUsage của tầng mới sẽ bằng minUsage của tầng cuối cùng.
        newMinUsage = lastTier.minUsage;
      }

      // Cập nhật maxUsage của tầng trước đó nếu nó đang là null
      // để nó kết thúc tại điểm bắt đầu của tầng mới.
      const updatedPrevTiers = prevTiers.map((tier, index) => {
        if (index === prevTiers.length - 1 && tier.maxUsage === null) {
          return { ...tier, maxUsage: newMinUsage };
        }
        return tier;
      });

      // Thêm tầng mới với minUsage đã tính và maxUsage ban đầu là null
      return [...updatedPrevTiers, { minUsage: newMinUsage, maxUsage: null, pricePerM3: "" }];
    });
  };

  const handleRemoveTier = (index) => {
    setPricingTiers(prevTiers => {
      const newTiers = prevTiers.filter((_, i) => i !== index);
      // Nếu tầng cuối cùng bị xóa, đảm bảo tầng cuối cùng mới có maxUsage: null
      if (index === prevTiers.length - 1 && newTiers.length > 0) {
        newTiers[newTiers.length - 1].maxUsage = null;
      }
      return newTiers;
    });
  };

  const handleTierChange = (index, field, value) => {
    setPricingTiers(prevTiers => {
      const newTiers = [...prevTiers];
      // Chuyển đổi giá trị sang số, nếu rỗng thì là null
      let numericValue = value === "" ? null : Number(value);

      // Đảm bảo minUsage không âm
      if (field === "minUsage" && numericValue !== null && numericValue < 0) {
        numericValue = 0;
      }
      // Đảm bảo pricePerM3 ít nhất là 1
      if (field === "pricePerM3" && numericValue !== null && numericValue < 1) {
        numericValue = 1;
      }

      newTiers[index][field] = numericValue;

      // Logic điều chỉnh minUsage của tầng tiếp theo nếu maxUsage của tầng hiện tại thay đổi
      if (field === "maxUsage" && index < newTiers.length - 1 && numericValue !== null) {
        // minUsage của tầng tiếp theo sẽ bằng maxUsage của tầng hiện tại
        newTiers[index + 1].minUsage = numericValue;
      }

      // Nếu maxUsage đang được đặt cho tầng cuối cùng, nó phải là null
      if (index === newTiers.length - 1 && field === "maxUsage" && value !== "") {
        newTiers[index].maxUsage = null; // Buộc tầng cuối cùng là vô hạn (null)
        alert("Tầng giá cuối cùng phải có 'Đến' là vô hạn. Trường 'Đến' đã được đặt lại là trống.");
      }

      return newTiers;
    });
  };

  const handleSubmit = () => {
    if (!typeName.trim()) {
      alert("Tên loại hợp đồng không được để trống.");
      return;
    }

    const isValidTiers = pricingTiers.every((tier, index) => {
      const min = tier.minUsage;
      const max = tier.maxUsage;
      const price = tier.pricePerM3;

      // Xác thực cơ bản cho tầng hiện tại: "Từ" không rỗng, không âm; "Giá" không rỗng, lớn hơn 0
      if (min === null || min < 0 || price === null || price <= 0) {
        return false;
      }

      // Kiểm tra "Đến" có hợp lệ không nếu nó không phải là null
      // "Đến" phải lớn hơn "Từ" và lớn hơn 0
      if (max !== null && (max < min || max <= 0)) {
        return false;
      }

      // Đảm bảo các tầng liên tiếp nhau (minUsage của tầng sau bằng maxUsage của tầng hiện tại)
      if (index < pricingTiers.length - 1) {
        const nextMin = pricingTiers[index + 1].minUsage;
        // Nếu maxUsage của tầng hiện tại là null (trừ tầng cuối cùng), hoặc minUsage của tầng sau là null,
        // hoặc minUsage của tầng sau không bằng maxUsage của tầng hiện tại
        if (max === null || nextMin === null || nextMin !== max) {
          return false;
        }
      }

      return true;
    });

    if (!isValidTiers) {
      alert("Vui lòng nhập đầy đủ và chính xác thông tin tầng giá (Từ, Đến, Giá). Giá phải lớn hơn 0. Các tầng giá phải liên tiếp nhau (Giá trị 'Từ' của tầng sau bằng 'Đến' của tầng trước). Tầng cuối cùng 'Đến' phải để trống.");
      return;
    }

    onSave({
      typeName: typeName,
      description,
      pricingTiers: pricingTiers.map(tier => ({
        ...tier,
        maxUsage: tier.maxUsage === 0 ? null : tier.maxUsage, // Vẫn chuyển 0 thành null để nhất quán
      })),
    });
    // Reset form về trạng thái ban đầu sau khi lưu
    setTypeName("");
    setDescription("");
    setPricingTiers([{ minUsage: 0, maxUsage: null, pricePerM3: "" }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm loại hợp đồng và tầng giá</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="typeName" className='mb-1'>Tên loại hợp đồng *</Label>
            <Input
              id="typeName"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="VD: Hộ gia đình, Thương mại"
            />
          </div>
          <div>
            <Label htmlFor="description" className='mb-1'>Mô tả</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về loại hợp đồng này"
            />
          </div>

          <h3 className="text-lg font-semibold mt-6">Tầng giá</h3>
          <div className="space-y-4">
            {pricingTiers.map((tier, index) => (
              <div key={index} className="flex items-end gap-2 border p-3 rounded-md">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`minUsage-${index}`} className='mb-1'>Từ (m³) *</Label>
                    <Input
                      id={`minUsage-${index}`}
                      type="number"
                      value={tier.minUsage === null ? "" : tier.minUsage}
                      onChange={(e) => handleTierChange(index, "minUsage", e.target.value)}
                      min="0"
                      disabled={index > 0} // Tắt trường "Từ" cho tất cả trừ tầng đầu tiên
                    />
                  </div>
                  <div>
                    <Label htmlFor={`maxUsage-${index}`} className='mb-1'>Đến (m³)</Label>
                    <Input
                      id={`maxUsage-${index}`}
                      type="number"
                      value={tier.maxUsage === null ? "" : tier.maxUsage}
                      onChange={(e) => handleTierChange(index, "maxUsage", e.target.value)}
                      placeholder={index === pricingTiers.length - 1 ? "Vô hạn" : ""} // Gợi ý "Vô hạn" cho tầng cuối
                      min={tier.minUsage !== null ? tier.minUsage : "0"} // Đảm bảo "Đến" không nhỏ hơn "Từ"
                      disabled={index === pricingTiers.length - 1} // Tắt trường "Đến" cho tầng cuối cùng
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pricePerM3-${index}`} className='mb-1'>Giá (VND/m³) *</Label>
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
                  disabled={pricingTiers.length <= 1} // Chỉ cho phép xóa khi có nhiều hơn 1 tầng
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
            <Button onClick={handleSubmit}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}