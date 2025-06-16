import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

export default function ContractRow({ contract, onSelectContract, isAllConfirmed, handleCreateInvoice }) {
  return (
    <TableRow key={contract.id}>
      <TableCell className="font-medium">{contract.id}</TableCell> {/* Contract Period ID */}
      <TableCell>{contract.customerCode}</TableCell> {/* Mã khách hàng */}
      <TableCell>{contract.customerName}</TableCell> {/* Tên khách hàng */}
      <TableCell>{contract.address}</TableCell>
      {/* Cột Ward đã bị loại bỏ */}
      <TableCell>{contract.recordCount}</TableCell>
      <TableCell>
        {isAllConfirmed(contract) ? (
          <Badge className="bg-green-600">Đã xác nhận</Badge>
        ) : (
          <Badge variant="secondary">Chờ xác nhận</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectContract(contract)} // Truyền toàn bộ đối tượng contract
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận
            </Button>
          </DialogTrigger>
          {isAllConfirmed(contract) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateInvoice(contract.id)} // Truyền contract.id (contractPeriodId)
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Tạo hóa đơn
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}