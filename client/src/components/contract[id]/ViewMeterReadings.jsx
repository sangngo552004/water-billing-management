import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function ViewMeterReadings({ readings, onClose }) {
  return (
    <div className="space-y-4">
      {readings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Tên kỳ</TableHead>
              <TableHead>Chỉ số cũ</TableHead>
              <TableHead>Chỉ số mới</TableHead>
              <TableHead>Tiêu thụ</TableHead>
              <TableHead>Ngày đo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.readingId}>
                <TableCell>{reading.periodName}</TableCell>
                <TableCell>{reading.previousReading}</TableCell>
                <TableCell>{reading.currentReading}</TableCell>
                <TableCell className="font-medium">{reading.usage} m³</TableCell>
                <TableCell>{reading.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center py-8 text-gray-500">Chưa có bản ghi đo nào</p>
      )}
      <div className="flex justify-end">
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  )
}