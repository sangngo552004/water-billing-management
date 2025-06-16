import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFacilities } from '../../hooks/useFacilities'; // Đảm bảo đường dẫn đúng
import { toast } from 'sonner';

export function ViewFacilityDetails({ facility, onClose }) {
  // Đổi tên biến 'loading' từ hook thành 'loadingDetails' để tránh nhầm lẫn nếu có các loading khác
  const { getFacilityDetails, loading: loadingDetails } = useFacilities();
  const [facilityDetails, setFacilityDetails] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      // Đảm bảo sử dụng facilityId, không phải facility.id
      if (facility?.facilityId) {
        try {
          // Gọi API để lấy chi tiết, chủ yếu là danh sách hợp đồng
          const details = await getFacilityDetails(facility.facilityId);
          console.log(details)
          if (details) {
            setFacilityDetails(details);
          }
        } catch (error) {
          toast.error(error.message || "Không thể tải chi tiết cơ sở.");
          setFacilityDetails(null); // Reset nếu có lỗi
        }
      } else {
        setFacilityDetails(null);
      }
    };
    // Thay đổi dependency từ facility?.id sang facility?.facilityId
    fetchDetails();
  }, [facility?.facilityId]);

  // Nếu không có prop facility, không render gì
  if (!facility) return null;

  // Hàm để lấy Badge trạng thái cho isActive của cơ sở
  const getIsActiveBadge = (isActive) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
    }
  };

  // Hàm để lấy Badge trạng thái cho hợp đồng
  const getContractStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm ngừng</Badge>;
      default:
        // Đảm bảo status là string, nếu không thì hiển thị "Không xác định"
        return <Badge variant="secondary">{typeof status === 'string' ? status : "Không xác định"}</Badge>;
    }
  };

  return (
    <div className="max-h-screen overflow-y-auto p-6 space-y-6">
      {/* Thông tin cơ sở */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Thông tin cơ sở</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">ID Cơ sở:</span>
            <span className="font-medium">{facility.facilityId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Địa chỉ:</span>
            <span className="font-medium">{facility.fullAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trạng thái:</span>
            <span className="font-medium">{getIsActiveBadge(facility.isActive)}</span>
          </div>
        </div>
      </div>

      {/* Danh sách hợp đồng */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Danh sách hợp đồng ({facilityDetails?.length || 0})
        </h3>
        {loadingDetails ? (
          <p className="text-gray-500 text-center py-4">Đang tải hợp đồng...</p>
        ) : facilityDetails && facilityDetails.length > 0 ? (
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
                {facilityDetails.map((contract) => (
                  <TableRow key={contract.contractId}>
                    <TableCell>{contract.contractId}</TableCell>
                    <TableCell>{contract.ownerFullName}</TableCell>
                    <TableCell>{contract.contractTypeName}</TableCell>
                    <TableCell>{getContractStatusBadge(contract.status)}</TableCell>
                    <TableCell>{contract.startDate}</TableCell>
                    <TableCell>
                        <Button
                        variant="link"
                        className="text-blue-600 hover:underline p-0"
                        onClick={() => {
                        // Thay thế phần này theo logic của bạn
                        // Ví dụ: navigate(`/contracts/${contract.contractId}`)
                        // hoặc mở dialog chi tiết hợp đồng
                        console.log("Xem chi tiết hợp đồng:", contract.contractId);
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

      {/* Nút đóng */}
      <div className="flex justify-end">
        <Button onClick={onClose} disabled={loadingDetails}>Đóng</Button>
      </div>
    </div>
  );
}