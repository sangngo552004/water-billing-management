import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Pause, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePeriodContracts } from "@/hooks/usePeriodDetail"; // This hook now handles both period and contracts
import Pagination from "@/components/common/Pagination";

const statuses = ["Tất cả", "pending", "reading", "blocked", "invoiced", "paid"];

export default function PeriodDetailPage() {
  const params = useParams();
  const billingPeriodId = params.periodId;

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);


  const {
    periodDetail, // Get periodDetail from the combined hook
    contracts,
    loading, // Single loading state for both period and contracts
    error,   // Single error state for both period and contracts
    totalPages,
    totalItems,
    blockContract,
    fetchData // Renamed from fetchContracts to fetchData as it now fetches both
  } = usePeriodContracts(billingPeriodId, search, selectedStatus, currentPage );

  const getStatusBadge = (status, isPaused) => {

    switch (status) {
      case "reading":
        return <Badge className="bg-blue-600">Đã ghi</Badge>;
      case "invoiced":
        return <Badge className="bg-yellow-600">Đã tạo hóa đơn</Badge>;
      case "paid":
        return <Badge className="bg-green-600">Đã thanh toán</Badge>;
      case "blocked":
        return <Badge variant="destructive">Không ghi được</Badge>;
      default:
        return <Badge variant="secondary">Chưa ghi</Badge>;
    }
  };

  const handleConfirmBlock = async () => {
    if (selectedContract) {
      try {
        await blockContract(selectedContract.id);
        setShowPauseDialog(false);
        setSelectedContract(null);
      } catch (err) {
        // Error handling is already in the hook
      }
    }
  };

  const canPause = (contract) => {
    return contract.status === "pending";
  };

  // Display loading for both period details and contracts
  if (loading && !periodDetail && contracts.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  // Display error if both periodDetail and contracts are null/empty after loading
  if (error && !periodDetail && contracts.length === 0) {
    return <div className="text-center text-red-600 py-8">Error: {error.message || "Failed to load data."}</div>;
  }

  // Use periodDetail if available, otherwise fallback to a default structure for initial render
  const displayPeriodDetail = periodDetail || {
    periodName: "Loading...",
    fromDate: "",
    toDate: "",
    totalContracts: totalItems, // Use totalItems from contracts if periodDetail not loaded yet
    readContracts: 0,
    invoicedContracts: 0,
    paidContracts: 0,
    unrecordedContracts: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/periods">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết kỳ {displayPeriodDetail.periodName}</h1>
          <p className="text-gray-600">
            {displayPeriodDetail.fromDate ? new Date(displayPeriodDetail.fromDate).toLocaleDateString("vi-VN") : "—"} -{" "}
            {displayPeriodDetail.toDate ? new Date(displayPeriodDetail.toDate).toLocaleDateString("vi-VN") : "—"}
          </p>
        </div>
      </div>

      {/* Period Summary - Now uses data from periodDetail */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{displayPeriodDetail.totalContracts || 0}</div>
              <div className="text-sm text-gray-600">Tổng hợp đồng</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayPeriodDetail.readContracts || 0}</div>
              <div className="text-sm text-gray-600">Đã ghi</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{displayPeriodDetail.paidContracts || 0}</div>
              <div className="text-sm text-gray-600">Đã thu</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{displayPeriodDetail.invoicedContracts || 0}</div>
              <div className="text-sm text-gray-600">Đã tạo hóa đơn</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{displayPeriodDetail.unrecordedContracts || 0}</div>
              <div className="text-sm text-gray-600">Không ghi được</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(displayPeriodDetail.totalContracts || 0) - (displayPeriodDetail.readContracts || 0) - (displayPeriodDetail.unrecordedContracts || 0)}
              </div>
              <div className="text-sm text-gray-600">Chưa ghi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hợp đồng ({totalItems})</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo mã khách hàng."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "pending" ? "Chưa ghi" :
                     status === "reading" ? "Đã ghi" :
                     status === "blocked" ? "Không ghi" :
                     status === "invoiced" ? "Đã tạo hóa đơn" :
                     status === "paid" ? "Đã thanh toán" :
                     status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? ( // Use the combined loading state
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : contracts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã khách hàng</TableHead>
                    <TableHead>Tên khách hàng</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Trạng thái ghi</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} className={contract.isPaused ? "bg-gray-50 opacity-75" : ""}>
                      <TableCell className="font-medium">{contract.customerCode}</TableCell>
                      <TableCell>{contract.customerName}</TableCell>
                      <TableCell>{contract.address}</TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status, contract.isPaused)}
                      </TableCell>
                      <TableCell>
                        {canPause(contract) && (
                          <Dialog open={showPauseDialog && selectedContract?.id === contract.id} onOpenChange={setShowPauseDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedContract(contract)}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Tạm dừng
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận tạm dừng hợp đồng</DialogTitle>
                              </DialogHeader>
                              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  Bạn có chắc chắn muốn tạm dừng hợp đồng này không? Hợp đồng sẽ được đánh dấu là "Không ghi được".
                                </p>
                              </div>
                              <DialogFooter>
                                <Button variant="destructive" onClick={handleConfirmBlock}>
                                  Xác nhận tạm dừng
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowPauseDialog(false);
                                    setSelectedContract(null);
                                  }}
                                >
                                  Hủy
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {search || selectedStatus !== "Tất cả"
                ? "Không tìm thấy hợp đồng nào phù hợp."
                : "Chưa có hợp đồng nào trong kỳ này."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}