import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CalculationDetails({ calculations, total }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết tính tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border">
            <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-medium text-sm">
              <div>Bậc tiêu thụ</div>
              <div>Lượng nước (m³)</div>
              <div>Đơn giá (₫/m³)</div>
              <div>Thành tiền (₫)</div>
            </div>
            {calculations.map((calc, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t">
                <div>{calc.tier}</div>
                <div>{calc.consumption}</div>
                <div>{calc.unitPrice.toLocaleString()}</div>
                <div>{calc.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{total.toLocaleString()} ₫</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}