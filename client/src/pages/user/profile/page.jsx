import { useState, useEffect } from 'react'; // Import useEffect, useState
import { useLocation } from 'react-router-dom'; // Import useLocation
import { useSelector } from 'react-redux'; // Import useSelector
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, FileTextIcon, XCircleIcon } from "lucide-react";

export default function ProfilePage() {
  const [contractData, setContractData] = useState(null); // State để lưu dữ liệu hợp đồng
  const [loading, setLoading] = useState(true); // State để theo dõi trạng thái tải
  const [error, setError] = useState(null); // State để lưu lỗi

  const location = useLocation(); // Lấy đối tượng location từ react-router-dom
  const contractId = location.pathname.split('/')[1]; // Trích xuất contractId từ URL
  const token = useSelector(state => state.auth.token); // Lấy token từ Redux store

  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!contractId || !token) {
        setError("Không có Contract ID hoặc Token xác thực.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Reset lỗi trước mỗi lần fetch mới

      try {
        const response = await fetch(`http://localhost:8080/api/owner/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Thêm token vào header
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Contract Data:", data); 

        setContractData({
          contractId: data.contractId, 
          customerCode: data.customerCode, 
          signDate: data.startDate ? new Date(data.startDate).toLocaleDateString('vi-VN') : 'N/A', 
          status: data.status ? data.status.toLowerCase() : 'unknown',
          customerInfo: {
            name: data.ownerFullName || 'N/A',
            identityNumber: data.identityNumber || 'N/A',
            phone: data.ownerPhoneNumber || 'N/A',
            email: data.ownerEmail || 'N/A',
            customerId: data.customerCode || 'N/A', 
            address: data.facilityAddress || 'N/A',
          },
          waterMeters: data.waterMeters ? data.waterMeters.map(meter => ({
            id: meter.serialNumber || 'N/A', 
            status: meter.isActive ? 'active' : 'inactive', 
            installDate: 'N/A', 
            address: data.facilityAddress || 'N/A', 
          })) : [],
        });
      } catch (err) {
        console.error("Không thể lấy chi tiết hợp đồng:", err);
        setError("Không thể tải thông tin hợp đồng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false); 
      }
    };

    fetchContractDetails();
  }, [contractId, token]); 

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>Đang hiệu lực</span>
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Hết hạn</Badge>;
      case "suspended":
        return <Badge variant="outline">Tạm ngưng</Badge>;
      case "unknown": // Thêm case này cho trạng thái không xác định
        return <Badge variant="secondary">Không xác định</Badge>;
      default:
        return null;
    }
  };

  const getMeterStatusBadge = (status) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Không tìm thấy thông tin hợp đồng.</p>
      </div>
    );
  }

  // Sử dụng contractData đã fetch thay vì mock contract
  const contract = contractData;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Thông tin</h1>
      </div>

      {/* Contract and Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Thông tin hợp đồng và khách hàng
          </CardTitle>
          <CardDescription>Chi tiết hợp đồng và thông tin cá nhân</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Họ và tên</div>
                <div className="text-lg font-medium">{contract.customerInfo.name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Số điện thoại</div>
                <div>{contract.customerInfo.phone}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div>{contract.customerInfo.email}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">CCCD</div>
                <div>{contract.customerInfo.identityNumber}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Mã khách hàng</div>
                <div className="flex items-center gap-2">
                  {contract.customerInfo.customerId}
                  {/* Badge này không có thông tin từ API để xác định đã xác thực hay chưa */}
                  
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Ngày ký hợp đồng</div>
                <div>{contract.signDate}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Trạng thái hợp đồng</div>
                <div className="mt-1">{getStatusBadge(contract.status)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Địa chỉ</div>
                <div>{contract.customerInfo.address}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Meters */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đồng hồ nước</CardTitle>
          <CardDescription>Danh sách đồng hồ nước theo hợp đồng</CardDescription>
        </CardHeader>
        <CardContent>
          {contract.waterMeters && contract.waterMeters.length > 0 ? (
            <div className="space-y-4">
              {contract.waterMeters.map((meter) => (
                <div key={meter.id} className="rounded-lg border p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Mã đồng hồ</div>
                        <div className="font-medium">{meter.id}</div> {/* Sử dụng serialNumber từ API */}
                      </div>

                      {/* Ngày lắp đặt không có trong API mới, bỏ qua */}
                      {/* <div>
                        <div className="text-sm font-medium text-gray-500">Ngày lắp đặt</div>
                        <div>{meter.installDate}</div>
                      </div> */}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                        <div>{getMeterStatusBadge(meter.status)}</div> {/* Sử dụng isActive từ API */}
                      </div>

                      {/* Địa chỉ đồng hồ nước (nếu khác địa chỉ hợp đồng) không có trong API, bỏ qua */}
                      {/* <div>
                        <div className="text-sm font-medium text-gray-500">Địa chỉ</div>
                        <div>{meter.address}</div>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">Không có thông tin đồng hồ nước nào.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
