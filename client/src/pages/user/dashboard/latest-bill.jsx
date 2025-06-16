import React from "react"; // Import React riêng biệt
import { useState, useEffect } from "react"; // Import hooks riêng biệt
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCardIcon, FileTextIcon } from "lucide-react";
import { Link } from "react-router-dom"; 

export default function LatestBill({ bill, handlePayInvoice }) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  // Khởi tạo paymentComplete an toàn hơn: mặc định là false, sau đó useEffect sẽ cập nhật
  const [paymentComplete, setPaymentComplete] = useState(false); 

  // Cập nhật paymentComplete khi bill prop thay đổi
  useEffect(() => {
    if (bill && bill.status && bill.status.toLowerCase() === 'paid') {
      setPaymentComplete(true);
    } else {
      setPaymentComplete(false);
    }
  }, [bill]); // Dependency vào 'bill' để phản ứng với thay đổi prop

  const handleInitiatePayment = () => {
    handlePayInvoice(bill.invoiceId);
    setPaymentComplete(true); // Cập nhật trạng thái thanh toán hoàn tất (tối ưu)
    setPaymentDialogOpen(false); // Đóng dialog
  };

  // Đảm bảo bill có dữ liệu trước khi truy cập các thuộc tính của nó
  if (!bill) {
    return <div className="text-gray-500">Không có hóa đơn gần nhất.</div>;
  }

  // Xác định hiển thị Badge dựa trên trạng thái hóa đơn
  const getStatusBadge = () => {
    const status = bill.status ? bill.status.toLowerCase() : '';
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800" variant="default">Đã thanh toán</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800" variant="default">Quá hạn</Badge>;
      case 'unpaid':
      default: // Xử lý các trạng thái không xác định là chưa thanh toán
        return <Badge variant="outline">Chưa thanh toán</Badge>;
    }
  };

  // Xác định liệu nút thanh toán có nên hiển thị không
  const showPayButton = bill.status && (bill.status.toLowerCase() === 'unpaid' || bill.status.toLowerCase() === 'overdue');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Mã hóa đơn</div>
          <div className="font-medium">{bill.invoiceId}</div>
        </div>
        {getStatusBadge()} 
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Kỳ hóa đơn</div>
          <div className="font-medium">{bill.periodName}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Lượng nước sử dụng</div>
          <div className="font-medium">{bill.totalUsage} m³</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tổng tiền</div>
          <div className="font-medium text-lg">{bill.totalPrice.toLocaleString()} ₫</div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm font-medium">Chi tiết hóa đơn</div>
        <div className="rounded-md border p-3">
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="font-medium">Đồng hồ</div>
            <div className="font-medium">Chỉ số cũ</div>
            <div className="font-medium">Chỉ số mới</div>
            <div className="font-medium">Tiêu thụ</div>
            {bill.waterMeterReadings.map(meter => (
              <React.Fragment key={meter.readingId}>
                <div>{meter.serialNumber}</div>
                <div>{meter.previousReading}</div>
                <div>{meter.currentReading}</div>
                <div>{meter.usage} m³</div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">Mục</div>
            <div className="font-medium">Đơn giá</div>
            <div className="font-medium">Thành tiền</div>
            {bill.pricingDetails.map(detail => (
              <React.Fragment key={detail.tierId}>
                <div>{`${detail.minUsage}-${detail.maxUsage !== null ? detail.maxUsage : ''} m³`}</div>
                <div>{detail.pricePerM3.toLocaleString()} ₫</div>
                <div>{detail.price.toLocaleString()} ₫</div>
              </React.Fragment>
            ))}
            <div className="col-span-2 font-medium">
              Tổng cộng
            </div>
            <div className="font-medium">{bill.totalPrice.toLocaleString()} ₫</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" asChild>
          <Link to={`/${bill.customerCode}/bills/${bill.invoiceId}`}>
            <FileTextIcon className="h-4 w-4" />
            <span>Xem chi tiết</span>
          </Link>
        </Button>
        {showPayButton && ( 
          <Button
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setPaymentDialogOpen(true)} 
          >
            <CreditCardIcon className="h-4 w-4" />
            <span>Thanh toán</span>
          </Button>
        )}
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn thanh toán hóa đơn này không?
            </DialogDescription>
          </DialogHeader>

          {paymentComplete || (bill.status && bill.status.toLowerCase() === "paid") ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium">Thanh toán thành công!</h3>
              <p className="mt-2 text-center text-sm text-gray-500">
                Cảm ơn bạn đã thanh toán hóa đơn. Hóa đơn của bạn đã được cập nhật.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Tổng tiền thanh toán</div>
                    <div className="text-lg font-bold">{bill.totalPrice.toLocaleString()} ₫</div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleInitiatePayment} className="bg-blue-600 hover:bg-blue-700">
                  Xác nhận và Thanh toán
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}