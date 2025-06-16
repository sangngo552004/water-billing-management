
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label" // Make sure Label is imported for contract details
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Plus, Trash2, Eye, Power, PowerOff } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {toast} from "sonner";

// Import separated components - Adjust paths if necessary based on your project structure
import AddWaterMeterForm from "@/components/contract[id]/AddWaterMeterForm" // Assuming it's in components
import ViewMeterReadings from "@/components/contract[id]/ViewMeterReadings" // Assuming it's in components

export default function ContractDetailPage() {
  const navigate = useNavigate()
  const { contractId } = useParams()

  const [contractDetails, setContractDetails] = useState(null)
  const [assignedWaterMeters, setAssignedWaterMeters] = useState([])
  const [availableWaterMeters, setAvailableWaterMeters] = useState([])
  const [meterReadings, setMeterReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedMeterIdForReadings, setSelectedMeterIdForReadings] = useState(null)
  const [isAddMeterOpen, setIsAddMeterOpen] = useState(false)
  const [isViewReadingsOpen, setIsViewReadingsOpen] = useState(false)
  const [deleteMeterConfirm, setDeleteMeterConfirm] = useState(null)
  const [toggleMeterConfirm, setToggleMeterConfirm] = useState(null)

  const token = localStorage.getItem('admin_token'); // Get token from localStorage

  const API_BASE_URL = "http://localhost:8080/api/admin";

  const fetchContractDetails = useCallback(async () => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log(`${API_BASE_URL}/contracts/${contractId}`);
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized or Forbidden access. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContractDetails(data);
      setAssignedWaterMeters(data.waterMeters)

    } catch (err) {
      console.error("Failed to fetch contract details:", err);
      toast.error("Lỗi khi tải chi tiết hợp đồng: "+err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contractId, token]);


  const fetchAvailableWaterMeters = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/water-meters?isActive=false&page=0&size=20`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableWaterMeters(data.content);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách đồng hồ nước chưa được gán");
      console.error("Failed to fetch available water meters:", err);
    }
  }, [token]);


  const fetchMeterReadings = useCallback(async (meterId) => {
    if (!token) return;
    if (!meterId) {
      console.warn("fetchMeterReadings called without meterId.");
      setMeterReadings([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/water-meters/${meterId}/readings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMeterReadings(data.content); // Set readings for the *selected* meter
    } catch (err) {
      console.error(`Failed to fetch meter readings for meter ${meterId}:`, err);
      toast.error("Lỗi khi tải bản ghi đo đồng hồ");
      setMeterReadings([]); // Clear readings on error
    }
  }, [contractId, token]);


  useEffect(() => {
    fetchContractDetails();
    fetchAvailableWaterMeters();
    // fetchMeterReadings() is intentionally *not* called here as it needs a specific meterId
  }, [fetchContractDetails, fetchAvailableWaterMeters]);

  const handleAddMeter = async (serialNumber, waterMeterId) => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/water-meters/${waterMeterId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ serialNumber })
      });
      const data = await response.json(); // <- Parse JSON từ response

      if (!response.ok) {
        throw new Error(data.message || "Thêm đồng hồ thất bại");
      }
      toast.success("Thêm đồng hồ nước vào hợp đồng thành công");
      await fetchContractDetails();
      // GIỮ DÒNG NÀY ĐỂ CẬP NHẬT DANH SÁCH ĐỒNG HỒ KHẢ DỤNG
      await fetchAvailableWaterMeters();
      setIsAddMeterOpen(false);
    } catch (err) {
      console.error("Failed to add meter:", err);
      toast.error(err.message);
    }
  };

  const handleDeleteMeter = async (meterId) => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/water-meters/${meterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // THÊM DÒNG NÀY ĐỂ CẬP NHẬT DANH SÁCH ĐỒNG HỒ ĐÃ GÁN SAU KHI XÓA
      await fetchContractDetails();
      // Không cần fetchAvailableWaterMeters() ở đây vì đồng hồ đã bị xóa hoàn toàn
      if (selectedMeterIdForReadings === meterId) {
        setMeterReadings([]);
        setIsViewReadingsOpen(false);
      }
      setDeleteMeterConfirm(null);
    } catch (err) {
      console.error("Failed to delete meter:", err);
      setError(`Failed to delete meter: ${err.message}`);
    }
  };

  const handleToggleMeter = useCallback(async (assignmentId, currentIsActiveStatus) => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    try {
      // Determine the action (activate or deactivate) based on current status
      const actionEndpoint = currentIsActiveStatus ? "deactivate" : "activate";
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/deactivate`, {
        method: "PUT", // Use PUT for status changes
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refresh contract details to update the meter's active status in the UI
      toast.success("Cập nhật trạng thái đồng hồ thành công");
      await fetchContractDetails();
      setToggleMeterConfirm(null); // Close the confirmation dialog
    } catch (err) {
      console.error("Failed to toggle meter status:", err);
      toast.error("Lỗi khi cập nhật trạng thái đồng hồ");
    }
  }, [token, fetchContractDetails]); // Add fetchContractDetails to dependencies


  const getStatusBadge = (status) => {
    switch (status) {
      case "active": // Assuming backend returns "active", "cancelled", "suspend" (lowercase)
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "suspend":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm ngừng</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewReadings = (meterId) => {
    setSelectedMeterIdForReadings(meterId);
    fetchMeterReadings(meterId); // Fetch readings for the selected meter
    setIsViewReadingsOpen(true);
  }

  // meterReadings now contains readings for the selected meter, so no filter needed here
  const readingsForModal = meterReadings;

  // Sửa: Tìm đồng hồ dựa trên assignmentId
  const selectedMeterForToggle = assignedWaterMeters.find((m) => m.assignmentId === toggleMeterConfirm)

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Đang tải chi tiết hợp đồng...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Lỗi: {error}</div>;
  }

  if (!contractDetails) {
    return <div className="p-6 text-center text-gray-600">Không tìm thấy chi tiết hợp đồng.</div>;
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết hợp đồng #{contractDetails.contractId}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Mã khách hàng</Label>
                  <p className="text-sm font-medium">{contractDetails.customerCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tên khách hàng</Label>
                  <p className="text-sm font-medium">{contractDetails.ownerFullName}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Địa chỉ</Label>
                <p className="text-sm">{contractDetails.facilityAddress}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Loại hợp đồng</Label>
                  <p className="text-sm">{contractDetails.contractTypeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Trạng thái</Label>
                  {getStatusBadge(contractDetails.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Số điện thoại</Label>
                  <p className="text-sm">{contractDetails.ownerPhoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{contractDetails.ownerEmail}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Ngày bắt đầu</Label>
                <p className="text-sm">{contractDetails.startDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Images */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {contractDetails.image ? (
                  <div className="border rounded-lg overflow-hidden col-span-2">
                    <img
                      src={contractDetails.image}
                      alt="Ảnh hợp đồng"
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-80"
                      onClick={() => window.open(contractDetails.image, "_blank")}
                    />
                  </div>
                ) : (
                  <p className="text-center text-gray-500 col-span-2">Không có ảnh hợp đồng</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Water Meters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách đồng hồ nước ({assignedWaterMeters.length})</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsAddMeterOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm đồng hồ
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thêm đồng hồ nước mới cho hợp đồng này</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {assignedWaterMeters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Số Serial</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead> Số đo hiện tại </TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedWaterMeters.map((meter) => (
                    <TableRow key={meter.assignmentId}>
                      <TableCell>{meter.assignmentId}</TableCell>
                      <TableCell className="font-medium">{meter.serialNumber}</TableCell>
                      <TableCell>
                        <Badge variant={meter.isActive ? "default" : "secondary"}>
                          {meter.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell>{meter.currentReading} m3</TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleViewReadings(meter.waterMeterId)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem bản ghi đo</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setToggleMeterConfirm(meter.assignmentId)}
                                className={meter.isActive ? "text-orange-600" : "text-green-600"}
                              >
                                {meter.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{meter.isActive ? "Dừng hoạt động" : "Bật hoạt động"}</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-gray-500">Chưa có đồng hồ nước nào được thêm vào hợp đồng này.</p>
            )}
          </CardContent>
        </Card>

        {/* Add Water Meter Modal */}
        <Dialog open={isAddMeterOpen} onOpenChange={setIsAddMeterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm đồng hồ nước</DialogTitle>
            </DialogHeader>
            <AddWaterMeterForm
              onClose={() => setIsAddMeterOpen(false)}
              onSubmit={handleAddMeter}
              availableWaterMeters={availableWaterMeters} // Pass available meters to the form
            />
          </DialogContent>
        </Dialog>

        {/* View Readings Modal */}
        <Dialog open={isViewReadingsOpen} onOpenChange={setIsViewReadingsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Bản ghi đo - Đồng hồ {assignedWaterMeters.find((m) => m.assignmentId === selectedMeterIdForReadings)?.serialNumber}
              </DialogTitle>
            </DialogHeader>
            <ViewMeterReadings
              readings={readingsForModal} // Pass readings for the selected meter
              onClose={() => setIsViewReadingsOpen(false)}
            />
          </DialogContent>
        </Dialog>


        {/* Toggle Meter Confirmation */}
        <AlertDialog open={!!toggleMeterConfirm} onOpenChange={() => setToggleMeterConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Xác nhận {selectedMeterForToggle?.isActive ? "dừng" : "bật"} hoạt động đồng hồ
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn {selectedMeterForToggle?.isActive ? "dừng" : "bật"} hoạt động đồng hồ này?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  toggleMeterConfirm &&
                  handleToggleMeter(toggleMeterConfirm, selectedMeterForToggle?.isActive)
                }
                className={
                  selectedMeterForToggle?.isActive
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {selectedMeterForToggle?.isActive ? "Dừng hoạt động" : "Bật hoạt động"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}