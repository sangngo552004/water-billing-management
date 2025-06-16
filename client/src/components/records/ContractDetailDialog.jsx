import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { EditRecordForm } from "./EditRecordForm";
import { toast } from "sonner"; // Import toast for confirmation

export const ContractDetailDialog = ({ contract, handleEditRecord, handleDeleteRecord }) => {

  const confirmDelete = (recordId) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-md shadow-lg flex items-center justify-between gap-4 border border-red-200">
        <p className="text-sm text-gray-700">Bạn có chắc chắn muốn xóa bản ghi này?</p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              handleDeleteRecord(recordId);
              toast.dismiss(t.id);
            }}
          >
            Xóa
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>
            Hủy
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep the toast open until dismissed
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <Eye className="h-4 w-4 mr-2" />
          Xem chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chi tiết bản ghi - {contract.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <strong>Khách hàng:</strong> {contract.customerName}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {contract.address}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đồng hồ</TableHead>
                <TableHead>Chỉ số cũ</TableHead>
                <TableHead>Chỉ số mới</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.waterMeterReadings.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.serialNumber}</TableCell>
                  <TableCell>{record.oldReading}</TableCell>
                  <TableCell>{record.newReading}</TableCell>
                  <TableCell>
                    {record.isConfirm ? (
                      <Badge className="bg-green-600">Đã xác nhận</Badge>
                    ) : (
                      <Badge variant="secondary">Chờ xác nhận</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!record.isConfirm && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa bản ghi</DialogTitle>
                            </DialogHeader>
                            <EditRecordForm record={record} onSave={handleEditRecord} onCancel={() => {}} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};