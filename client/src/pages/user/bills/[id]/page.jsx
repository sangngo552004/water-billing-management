import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PrinterIcon, DownloadIcon } from "lucide-react"
import CompanyInfo from "./CompanyInfo"
import BillInfo from "./BillInfo"
import MeterReadings from "./MeterReading"
import CalculationDetails from "./CalculationDetails"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react" // Import useEffect and useState
import { Skeleton } from "@/components/ui/skeleton" // Assuming you have a Skeleton component for loading
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Assuming you have an Alert component for errors
import { Terminal } from "lucide-react" // For the Alert icon
import { useSelector } from 'react-redux';


export default function BillDetailPage() {
  const { id, customerCode } = useParams() // 'id' will be your invoiceId

  const [bill, setBill] = useState(null) // State to hold the fetched bill data
  const [loading, setLoading] = useState(true) // State to manage loading status
  const [error, setError] = useState(null) // State to hold any fetch errors

  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {

      if (!token) {
      setErrorBills("Missing Contract ID or Authentication Token to load invoices.");
      setLoading(false);
      return;
    }
      setLoading(true) // Start loading
      setError(null) // Clear previous errors
      
      try {

        const response = await fetch(`http://localhost:8080/api/owner/invoices/${id}`,{
        headers: {
          'Authorization': `Bearer ${token}`, // Include authorization token
          'Content-Type': 'application/json'
        },
      }) // Make the API call
        if (!response.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
       
        const mappedBill = {
          id: data.invoiceId,
          period: data.periodName,
          issueDate: new Date(data.createdAt).toLocaleDateString('en-GB'), // Format date as DD/MM/YYYY
          status: data.status.toLowerCase(), // Ensure status is lowercase to match your badge logic
          customerId: data.customerCode,
          customerName: data.ownerName, // This info is missing from API, you might need another endpoint or pass it down
          address: data.facilityAddress, // This info is missing from API, you might need another endpoint or pass it down
          meters: data.waterMeterReadings.map(meter => ({
            id: meter.serialNumber, // Use serialNumber as the ID for display
            previousReading: meter.previousReading,
            currentReading: meter.currentReading,
            consumption: meter.usage, // Use usage from API
          })),
          calculations: data.pricingDetails.map(calc => ({
            tier: `${calc.minUsage}-${calc.maxUsage} m³`, // Reconstruct tier name
            consumption: calc.usageOfTier,
            unitPrice: calc.pricePerM3,
            amount: calc.price,
          })),
          total: data.totalPrice,
        }

        setBill(mappedBill) // Update the bill state with fetched data
      } catch (e) {
        console.error("Failed to fetch invoice:", e)
        setError("Failed to load invoice details. Please try again.") // Set error message
      } finally {
        setLoading(false) // End loading
      }
    }

    if (id) { 
      fetchInvoiceDetails()
    }
  }, [id]) 


  const handleExportPDF = () => {
    if (!bill) return; // Prevent export if bill data isn't loaded yet

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${bill.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .bill-info { margin-bottom: 20px; }
          .meter-info { margin-bottom: 20px; }
          .calculation { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN TIỀN NƯỚC</h1>
          <h2>Mã hóa đơn: ${bill.id}</h2>
        </div>
        
        <div class="company-info">
          <h3>THÔNG TIN CÔNG TY</h3>
          <p><strong>Tên công ty:</strong> Công ty Cấp nước Thành phố Hồ Chí Minh</p>
          <p><strong>Địa chỉ:</strong> 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</p>
          <p><strong>Điện thoại:</strong> (028) 3829 1234</p>
          <p><strong>Email:</strong> info@capnuoc.com.vn</p>
        </div>

        <div class="bill-info">
          <h3>THÔNG TIN HÓA ĐƠN</h3>
          <p><strong>Mã khách hàng:</strong> ${bill.customerId}</p>
          <p><strong>Tên khách hàng:</strong> ${bill.customerName}</p>
          <p><strong>Địa chỉ:</strong> ${bill.address}</p>
          <p><strong>Kỳ hóa đơn:</strong> ${bill.period}</p>
          <p><strong>Ngày phát hành:</strong> ${bill.issueDate}</p>
        </div>

        <div class="meter-info">
          <h3>THÔNG TIN ĐỒNG HỒ NƯỚC</h3>
          <table>
            <tr>
              <th>Mã đồng hồ</th>
              <th>Chỉ số cũ (m³)</th>
              <th>Chỉ số mới (m³)</th>
              <th>Lượng tiêu thụ (m³)</th>
            </tr>
            ${bill.meters
              .map(
                (meter) => `
              <tr>
                <td>${meter.id}</td>
                <td>${meter.previousReading}</td>
                <td>${meter.currentReading}</td>
                <td>${meter.consumption}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </div>

        <div class="calculation">
          <h3>CHI TIẾT TÍNH TIỀN</h3>
          <table>
            <tr>
              <th>Bậc tiêu thụ</th>
              <th>Lượng nước (m³)</th>
              <th>Đơn giá (₫/m³)</th>
              <th>Thành tiền (₫)</th>
            </tr>
            ${bill.calculations
              .map(
                (calc) => `
              <tr>
                <td>${calc.tier}</td>
                <td>${calc.consumption}</td>
                <td>${calc.unitPrice.toLocaleString()}</td>
                <td>${calc.amount.toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="total">
              <td colspan="3">TỔNG CỘNG</td>
              <td>${bill.total.toLocaleString()} ₫</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case "unpaid":
        return <Badge variant="outline">Chưa thanh toán</Badge>
      case "overdue":
        return <Badge variant="destructive">Quá hạn</Badge>
      default:
        return null
    }
  }

  // --- Render logic based on loading, error, and data states ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/${customerCode}/bills`}>
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" /> {/* Placeholder for CompanyInfo */}
          <Skeleton className="h-[250px] w-full" /> {/* Placeholder for BillInfo */}
          <Skeleton className="h-[200px] w-full" /> {/* Placeholder for MeterReadings */}
          <Skeleton className="h-[300px] w-full" /> {/* Placeholder for CalculationDetails */}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </Alert>
    )
  }

  if (!bill) {
    return <div className="text-center py-10">No invoice data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/${customerCode}/bills`}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết hóa đơn</h1>
            <p className="text-gray-500">Mã hóa đơn: {bill.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
            <PrinterIcon className="h-4 w-4" />
            In hóa đơn
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
            <DownloadIcon className="h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <CompanyInfo />
        <BillInfo bill={bill} getStatusBadge={getStatusBadge} />
        <MeterReadings meters={bill.meters} />
        <CalculationDetails calculations={bill.calculations} total={bill.total} />
      </div>
    </div>
  )
}