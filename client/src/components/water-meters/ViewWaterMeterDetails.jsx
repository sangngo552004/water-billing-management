import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";

export default function ViewWaterMeterDetails({ meter, contracts, onClose, onViewContract }) {
  if (!meter) return null; // Ensure meter data is available

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm ngừng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-h-screen overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin đồng hồ</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Số Serial:</span>
              <span className="font-medium">{meter.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <Badge variant={meter.isActive ? "default" : "secondary"}>
                {meter.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="font-medium">{new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(meter.createdAt))}</span>
            </div>
          </div>
        </div>
      </div>

      <div >
        <h3 className="text-lg font-semibold mb-4">
        Danh sách hợp đồng ({contracts.length || 0})
        </h3>
        { contracts && contracts.length > 0 ? (
        <div className="max-h-96 overflow-y-auto border rounded-md">
        <Table>
                <TableHeader>
                <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Chủ sở hữu</TableHead>
                <TableHead>Loại hợp đồng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Hành động</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {contracts.map((contract) => (
                <TableRow key={contract.contractId}>
                <TableCell>{contract.contractId}</TableCell>
                <TableCell>{contract.ownerFullName}</TableCell>
                <TableCell>{contract.contractTypeName}</TableCell>
                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                <TableCell>{contract.startDate}</TableCell>
                <TableCell>
                        <Button
                        variant="link"
                        className="text-blue-600 hover:underline p-0"
                        onClick={() => {

                        onViewContract(contract.contractId);
                        }}
                        >
                        Xem chi tiết
                        </Button>
                </TableCell>
                </TableRow>
                ))}
                </TableBody>
        </Table>
        </div>
        ) : (
        <p className="text-gray-500 text-center py-4">Cơ sở chưa có hợp đồng nào</p>
        )}
        </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}