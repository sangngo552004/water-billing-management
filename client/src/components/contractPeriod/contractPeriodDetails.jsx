import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Eye } from "lucide-react";
import { Dialog as ImageDialog, DialogContent as ImageDialogContent, DialogHeader as ImageDialogHeader, DialogTitle as ImageDialogTitle, DialogTrigger as ImageDialogTrigger } from "@/components/ui/dialog"; // Alias để tránh xung đột

export default function ContractPeriodDetailDialog({
  isOpen,
  onOpenChange,
  contract,
  handleConfirmRecord,
  handleCreateInvoice,
  isAllConfirmed,
}) {
  if (!contract) return null;

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden" // Giữ các lớp khác bạn muốn
  style={{
    maxWidth: '800px', // Thử giá trị cố định và dùng px
    width: '100%',
  }}>
        <DialogHeader>
          <DialogTitle>Chi tiết hợp đồng {contract.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Thông tin chung của hợp đồng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm md:text-base">
            <div>
              <strong>Khách hàng:</strong> {contract.customerName} ({contract.customerCode})
            </div>
            <div>
              <strong>Địa chỉ:</strong> {contract.address}
            </div>
            <div>
              <strong>Hợp đồng:</strong> {contract.id}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* ĐIỀU CHỈNH CHUẨN LẠI CHIỀU RỘNG CÁC CỘT */}
                  <TableHead className="w-[120px] min-w-[120px]">Đồng hồ (Serial)</TableHead>
                  <TableHead className="w-[90px] min-w-[90px]">Chỉ số cũ</TableHead>
                  <TableHead className="w-[90px] min-w-[90px]">Chỉ số mới</TableHead>
                  <TableHead className="w-[70px] min-w-[70px]">Số m³</TableHead>
                  <TableHead className="w-[120px] min-w-[120px]">Hình ảnh</TableHead>
                  {/* QUAN TRỌNG: Đặt chiều rộng tối thiểu cho "Ghi chú" hoặc một chiều rộng hợp lý */}
                  <TableHead className="w-[120px] min-w-[120px]">Trạng thái</TableHead>
                  {/* QUAN TRỌNG: Đảm bảo cột "Hành động" đủ rộng và căn phải */}
                  <TableHead className="w-[130px] min-w-[130px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.meters.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium text-sm whitespace-nowrap">{reading.serialNumber}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{reading.oldReading}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{reading.newReading}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{reading.volume}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {reading.image ? (
                        <ImageDialog>
                          <ImageDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem ảnh
                            </Button>
                          </ImageDialogTrigger>
                          <ImageDialogContent className="max-w-2xl">
                            <ImageDialogHeader>
                              <ImageDialogTitle>Hình ảnh đồng hồ {reading.serialNumber}</ImageDialogTitle>
                            </ImageDialogHeader>
                            <div className="flex justify-center p-2">
                              <img
                                src={reading.image || "/placeholder.svg"}
                                alt={`Đồng hồ ${reading.serialNumber}`}
                                className="max-w-full h-auto rounded-lg border"
                              />
                            </div>
                          </ImageDialogContent>
                        </ImageDialog>
                      ) : (
                        <span className="text-gray-400 text-xs">Không có ảnh</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {reading.isConfirmed ? (
                        <Badge className="bg-green-600 text-xs">Đã xác nhận</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Chờ xác nhận</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {!reading.isConfirmed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirmRecord(contract.id, reading.id)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Xác nhận
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {isAllConfirmed(contract) && (
              <Button
                onClick={() => {
                  handleCreateInvoice(contract.id);
                  onOpenChange(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Tạo hóa đơn
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

}