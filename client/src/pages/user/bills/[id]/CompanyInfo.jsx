import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, PrinterIcon, DownloadIcon } from "lucide-react"

// Company Information Component
export default function CompanyInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin công ty</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-500">Tên công ty</div>
                <div className="font-medium">Công ty Cấp nước Thành phố Hồ Chí Minh</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Địa chỉ</div>
                <div>123 Đường Nguyễn Huệ, Quận 1, TP.HCM</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Điện thoại</div>
                <div>(028) 3829 1234</div>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-500">Mã số thuế</div>
                <div>0123456789</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Website</div>
                <div>www.capnuoc.com.vn</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div>info@capnuoc.com.vn</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}