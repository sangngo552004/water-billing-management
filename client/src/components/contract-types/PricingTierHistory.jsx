import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button"; // Không cần nếu không có nút
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Không cần nếu không có tooltip cho nút
// import { Edit, Trash2 } from "lucide-react"; // Không cần nếu không có icon

export default function PricingTierHistory({
  selectedContractType,
  contractTypes,
  pricingTiers, // This will be the filtered tiers based on selectedContractType
  // onEditTier,   // Bỏ prop này
  // onDeleteTier, // Bỏ prop này
}) {
  // Nhóm tầng giá theo cụm
  const groupedTiers = pricingTiers.reduce(
    (groups, tier) => {
      const groupId = tier.groupId;
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(tier);
      return groups;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Lịch sử tầng giá{" "}
          {selectedContractType ? `- ${contractTypes.find((t) => t.id === selectedContractType)?.name}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedContractType ? (
          <div className="space-y-6">
            {Object.keys(groupedTiers).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có tầng giá nào cho loại hợp đồng này.
              </div>
            ) : (
              Object.entries(groupedTiers).map(([groupId, tiers]) => (
                <div key={groupId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Từ (m³)</TableHead>
                        <TableHead>Đến (m³)</TableHead>
                        <TableHead>Giá (VND/m³)</TableHead>
                        {/* <TableHead>Hành động</TableHead> // Bỏ cột hành động */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.minUsage}</TableCell>
                          <TableCell>{tier.maxUsage === null ? "Vô hạn" : tier.maxUsage}</TableCell>
                          <TableCell>{tier.pricePerM3.toLocaleString()} VND</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Chọn loại hợp đồng để xem lịch sử tầng giá</div>
        )}
      </CardContent>
    </Card>
  );
}