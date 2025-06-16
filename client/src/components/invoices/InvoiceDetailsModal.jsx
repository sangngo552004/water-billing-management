// components/invoices/InvoiceDetailsModal.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InvoiceDetailsModal({ invoice, isOpen, onClose }) {
  if (!invoice) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "TM":
        return "Tiền mặt";
      case "CK": 
        return "Chuyển khoản";
      default:
        return method;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case "unpaid":
        return <Badge className="bg-gray-100 text-gray-800">Chưa thanh toán</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
      case "cancelled":
        return <Badge className="bg-yellow-100 text-yellow-800">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết hóa đơn #{invoice?.invoiceId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Mã khách hàng</Label>
                <p className="text-sm font-medium">{invoice.customerCode}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Tên chủ sở hữu</Label>
                <p className="text-sm font-medium">{invoice.ownerName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Địa chỉ cơ sở</Label>
                <p className="text-sm">{invoice.facilityAddress}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Kỳ hóa đơn</Label>
                <p className="text-sm">{invoice.periodName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Trạng thái</Label>
                <div className="mt-1">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Tổng tiền</Label>
                <p className="text-lg font-bold text-red-600">{formatCurrency(invoice.totalPrice)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Tổng tiêu thụ</Label>
                <p className="text-sm font-medium">{invoice.totalUsage} m³</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Ngày tạo</Label>
                <p className="text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          {invoice.status === "paid" && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phương thức thanh toán</Label>
                    <p className="text-sm">{getPaymentMethodText(invoice.paymentMethod)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ngày thanh toán</Label>
                    <p className="text-sm">{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chi tiết bản ghi nước */}
          {invoice.waterMeterReadings && invoice.waterMeterReadings.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Chi tiết bản ghi nước</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Chỉ số cũ</TableHead>
                    <TableHead>Chỉ số mới</TableHead>
                    <TableHead>Tiêu thụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.waterMeterReadings.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.serialNumber}</TableCell>
                      <TableCell>{record.previousReading}</TableCell>
                      <TableCell>{record.currentReading}</TableCell>
                      <TableCell>{record.usage} m³</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Cách tính tiền theo tầng */}
          {invoice.pricingDetails && invoice.pricingDetails.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Cách tính tiền theo tầng</h3>
              <div className="space-y-3">
                {invoice.pricingDetails.map((tier, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    tier.usageOfTier > 0 ? "bg-blue-50" : "bg-gray-50"
                  }`}>
                    <span>
                      Tầng {index + 1} ({tier.minUsage}-{tier.maxUsage === null ? "..." : tier.maxUsage} m³ @ {formatCurrency(tier.pricePerM3)}/m³): {tier.usageOfTier} m³
                    </span>
                    <span className="font-medium">
                      {formatCurrency(tier.price)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded font-bold">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(invoice.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}