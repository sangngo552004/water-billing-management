// src/components/contract-types/ContractTypeManagement.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Edit, DollarSign, Trash2 } from "lucide-react";

export default function ContractTypeManagement({
  contractTypes,
  selectedContractType,
  setSelectedContractType,
  onAddType,
  onEditType,
  onEditPriceType,
  onDeleteType,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Quản lý loại hợp đồng
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={onAddType}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm loại
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm loại hợp đồng mới và tầng giá</TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên loại</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractTypes.map((type) => (
              <TableRow
                key={type.id}
                className={selectedContractType === type.id ? "bg-blue-50" : ""}
                onClick={() => setSelectedContractType(type.id)}
              >
                <TableCell className="font-medium cursor-pointer">{type.name}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEditType(type); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sửa tên loại hợp đồng</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEditPriceType(type.id); }}>
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chỉnh sửa tầng giá</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteType(type.id); }} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa loại hợp đồng</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}