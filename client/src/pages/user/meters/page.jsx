import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom'; // Import useLocation
import { useSelector } from 'react-redux'; // Import useSelector
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Input not used, can be removed if not needed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardListIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";


export default function MetersPage() {
  // Lấy contractId từ URL
  const location = useLocation();
  const contractId = location.pathname.split('/')[1];

  // Lấy token từ Redux store
  const token = useSelector(state => state.auth.token);

  // State cho danh sách đồng hồ nước
  const [waterMeters, setWaterMeters] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [errorMeters, setErrorMeters] = useState(null);

  // State cho bản ghi của đồng hồ nước được chọn
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [selectedMeterSerialNumber, setSelectedMeterSerialNumber] = useState(null); // Lưu serialNumber để hiển thị tiêu đề
  const [selectedMeterReadings, setSelectedMeterReadings] = useState([]);
  const [readingsDialogOpen, setReadingsDialogOpen] = useState(false);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [errorReadings, setErrorReadings] = useState(null);


  /**
   * Fetch danh sách đồng hồ nước cho contractId hiện tại.
   * Sử dụng useCallback để memoize hàm này, tránh re-render không cần thiết.
   */
  const fetchWaterMeters = useCallback(async () => {
    // Không fetch nếu không có contractId hoặc token
    if (!contractId || !token) {
      setErrorMeters("Thiếu Contract ID hoặc Token xác thực để tải danh sách đồng hồ nước.");
      setLoadingMeters(false);
      return;
    }

    setLoadingMeters(true);
    setErrorMeters(null); // Reset lỗi

    try {
      const url = `http://localhost:8080/api/owner/contracts/${contractId}/water-meters`;
      console.log("Fetching water meters from:", url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      const data = await response.json();
      console.log("Water meters data received:", data);

      // Ánh xạ dữ liệu API vào cấu trúc phù hợp với UI
      const mappedMeters = data.map(meter => ({
        id: meter.waterMeterId, // waterMeterId làm ID duy nhất cho mỗi đồng hồ
        serialNumber: meter.serialNumber, // Mã đồng hồ (để hiển thị)
        status: meter.isActive ? "active" : "inactive", // isActive -> status
        // installDate không có trong API, giữ "N/A"
        installDate: "N/A",
        lastReading: meter.currentReading, // currentReading -> lastReading
      }));

      setWaterMeters(mappedMeters);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đồng hồ nước:", err);
      setErrorMeters("Không thể tải danh sách đồng hồ nước. Vui lòng thử lại sau.");
      setWaterMeters([]);
    } finally {
      setLoadingMeters(false);
    }
  }, [contractId, token]); // Dependencies: contractId và token


  const fetchMeterReadings = useCallback(async (meterId) => {
    if (!contractId || !token || !meterId) {
      setErrorReadings("Thiếu thông tin để tải bản ghi đồng hồ nước.");
      setLoadingReadings(false);
      return;
    }

    setLoadingReadings(true);
    setErrorReadings(null); // Reset lỗi
    setSelectedMeterReadings([]); // Xóa bản ghi cũ khi tải mới

    try {
      const url = `http://localhost:8080/api/owner/contracts/${contractId}/water-meters/${meterId}/readings`;
      console.log("Fetching meter readings from:", url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meter readings data received:", data);

      const mappedReadings = data.content.map(reading => ({
        id: reading.readingId,
        periodName: reading.periodName,
        date: reading.createdAt ? new Date(reading.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        initialReading: reading.previousReading,
        finalReading: reading.currentReading,
        consumption: reading.usage,
      }));

      setSelectedMeterReadings(mappedReadings);
    } catch (err) {
      console.error("Lỗi khi tải bản ghi đồng hồ nước:", err);
      setErrorReadings("Không thể tải bản ghi đồng hồ nước. Vui lòng thử lại sau.");
      setSelectedMeterReadings([]);
    } finally {
      setLoadingReadings(false);
    }
  }, [contractId, token]); // Dependencies: contractId và token


  // Effect để fetch danh sách đồng hồ nước khi component mount
  // hoặc khi contractId/token thay đổi
  useEffect(() => {
    fetchWaterMeters();
  }, [fetchWaterMeters]); // Dependency là hàm useCallback


  const handleViewReadings = (meterId, serialNumber) => {
    setSelectedMeterId(meterId);
    setSelectedMeterSerialNumber(serialNumber); // Lưu serialNumber
    setReadingsDialogOpen(true);
    fetchMeterReadings(meterId); // Gọi API để fetch bản ghi
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>Hoạt động</span>
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircleIcon className="h-3 w-3" />
            <span>Không hoạt động</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loadingMeters) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Đang tải danh sách đồng hồ nước...</p>
      </div>
    );
  }

  if (errorMeters) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-red-600">
        <p>{errorMeters}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đồng hồ nước</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đồng hồ</TableHead>
              <TableHead>Chỉ số hiện tại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waterMeters.length > 0 ? (
              waterMeters.map((meter) => (
                <TableRow key={meter.id}>
                  <TableCell className="font-medium">{meter.serialNumber}</TableCell> 
                  <TableCell>{meter.lastReading} m³</TableCell>
                  <TableCell>{getStatusBadge(meter.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1" 
                      onClick={() => handleViewReadings(meter.id, meter.serialNumber)} // Truyền cả ID và SerialNumber
                    >
                      <ClipboardListIcon className="h-4 w-4" />
                      <span>Bản ghi</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy đồng hồ nước nào cho hợp đồng này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={readingsDialogOpen} onOpenChange={setReadingsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bản ghi đồng hồ nước {selectedMeterSerialNumber}</DialogTitle> {/* Hiển thị serialNumber */}
          </DialogHeader>

          {loadingReadings && (
            <div className="text-center text-gray-500 py-4">Đang tải bản ghi...</div>
          )}
          {errorReadings && (
            <div className="text-center text-red-600 py-4">{errorReadings}</div>
          )}

          {!loadingReadings && !errorReadings && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kỳ ghi</TableHead>
                    <TableHead>Ngày ghi</TableHead>
                    <TableHead>Chỉ số đầu</TableHead>
                    <TableHead>Chỉ số cuối</TableHead>
                    <TableHead>Tiêu thụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMeterReadings.length > 0 ? (
                    selectedMeterReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>{reading.periodName}</TableCell>
                        <TableCell>{reading.date}</TableCell>
                        <TableCell>{reading.initialReading} m³</TableCell>
                        <TableCell>{reading.finalReading} m³</TableCell>
                        <TableCell>{reading.consumption} m³</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Không tìm thấy bản ghi nào cho đồng hồ này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
