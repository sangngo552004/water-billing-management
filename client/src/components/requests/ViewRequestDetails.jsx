import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function ViewRequestDetails({ request, onClose }) {
  if (!request) return null;

  const getType = (type) => {
    switch (type) {
      case 'ChangeInfo':
        return 'Thay đổi thông tin';
      case 'StopService':
        return 'Dừng dịch vụ';
      default:
        return type;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Đang chờ</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Đã phê duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">ID Yêu cầu</Label>
          <p className="text-sm font-semibold">{request.requestId}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Khách hàng</Label>
          <p className="text-sm">{request.ownerFullName}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Mã khách hàng</Label>
          <p className="text-sm">{request.customerCode}</p>
        </div>
        <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">Thời gian gửi</Label>
        <p className="text-sm"> {new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(request.createdAt))}</p>
      </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Loại yêu cầu</Label>
          <p className="text-sm">{getType(request.requestType)}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Trạng thái</Label>
          {getStatusBadge(request.status)}
        </div>
      </div>
      

      {/* Conditional details based on request type */}
      {request.requestType === 'ChangeInfo' && (
        <div className="space-y-2 border-t pt-4 mt-4">
          <h4 className="font-semibold text-base">Thông tin thay đổi</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Thông tin cũ</Label>
              <p className="text-sm">{request.changeInfoDetails.oldFullName || 'N/A'}</p>
              <p className="text-sm">{request.changeInfoDetails.oldEmail || 'N/A'}</p>
              <p className="text-sm">{request.changeInfoDetails.oldPhoneNumber || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Thông tin mới</Label>
              <p className="text-sm">{request.changeInfoDetails.newFullName || 'N/A'}</p>
              <p className="text-sm">{request.changeInfoDetails.newEmail || 'N/A'}</p>
              <p className="text-sm">{request.changeInfoDetails.newPhoneNumber || 'N/A'}</p>
            </div>
          </div>
          
        </div>
      )}

      {request.requestType === 'StopService' && (
        <div className="space-y-2 border-t pt-4 mt-4">
          <h4 className="font-semibold text-base">Chi tiết dừng dịch vụ</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Lý do</Label>
              <p className="text-sm">{request.stopServiceDetails.reason || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      

      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}