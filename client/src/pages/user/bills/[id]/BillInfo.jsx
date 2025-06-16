import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BillInfo({ bill, getStatusBadge }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin hóa đơn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-500">Mã khách hàng</div>
              <div className="font-medium">{bill.customerId}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Tên khách hàng</div>
              <div className="font-medium">{bill.customerName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Địa chỉ</div>
              <div>{bill.address}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-500">Kỳ hóa đơn</div>
              <div className="font-medium">{bill.period}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Ngày phát hành</div>
              <div>{bill.issueDate}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Trạng thái</div>
              <div>{getStatusBadge(bill.status)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}