import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeterReadings({ meters }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đồng hồ nước</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meters.map((meter) => (
            <div key={meter.id} className="rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Mã đồng hồ</div>
                  <div className="font-medium">{meter.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Chỉ số cũ</div>
                  <div>{meter.previousReading} m³</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Chỉ số mới</div>
                  <div>{meter.currentReading} m³</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Lượng tiêu thụ</div>
                  <div className="text-lg font-bold text-blue-600">{meter.consumption} m³</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}