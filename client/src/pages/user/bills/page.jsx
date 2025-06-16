import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDownIcon, EyeIcon } from "lucide-react"; // Removed ChevronLeftIcon, ChevronRightIcon


export default function BillsPage() {
  // Lấy contractId từ URL
  const location = useLocation();
  const contractId = location.pathname.split('/')[1];

  // Lấy token xác thực từ Redux store
  const token = useSelector(state => state.auth.token);

  // Lấy năm hiện tại để làm mặc định và tùy chọn duy nhất cho bộ lọc năm
  const currentYear = new Date().getFullYear().toString();

  // State cho danh sách hóa đơn đã fetch
  const [fetchedBills, setFetchedBills] = useState([]);
  // State theo dõi trạng thái tải hóa đơn
  const [loadingBills, setLoadingBills] = useState(true);
  // State lưu trữ lỗi khi tải hóa đơn
  const [errorBills, setErrorBills] = useState(null);

  // States cho bộ lọc và sắp xếp
  const [yearFilter, setYearFilter] = useState(currentYear); // Mặc định là năm hiện tại
  const [sortBy, setSortBy] = useState("createdAt"); // Sắp xếp theo ngày tạo (createdAt từ API)
  const [sortOrder, setSortOrder] = useState("desc"); // Thứ tự giảm dần


  /**
   * Hàm bất đồng bộ để fetch danh sách hóa đơn từ API.
   * Sử dụng useCallback để memoize hàm này, chỉ tạo lại khi 'contractId', 'token', hoặc 'yearFilter' thay đổi.
   * @param {string} currentContractId - The ID of the current contract.
   * @param {string} selectedYear - The selected year for filtering invoices.
   */
  const fetchBills = useCallback(async (currentContractId, selectedYear) => {
    // Ngăn chặn việc fetch nếu không có contractId hoặc token
    if (!currentContractId || !token) {
      setErrorBills("Missing Contract ID or Authentication Token to load invoices.");
      setLoadingBills(false);
      return;
    }

    setLoadingBills(true);
    setErrorBills(null); // Reset error before new fetch

    try {
      // Construct API URL with year parameter
      const url = `http://localhost:8080/api/owner/contracts/${currentContractId}/invoices?year=${selectedYear}`;
      console.log("Fetching invoices from:", url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include authorization token
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Invoices data received:", data);

      // Map API response data (InvoiceListDTO) to UI's expected structure
      const mappedBills = data.content.map(bill => ({
        id: bill.invoiceId,
        period: bill.periodName || 'N/A', // Use 'period' if available, otherwise "N/A"
        date: bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('vi-VN') : 'N/A', // Format creation date
        status: bill.status ? bill.status.toLowerCase() : 'unknown', // Convert status to lowercase
        amount: bill.totalPrice || 0, // Total price
        consumption: bill.totalUsage || 0, // Total consumption
      }));

      setFetchedBills(mappedBills);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setErrorBills("Failed to load invoices. Please try again later.");
      setFetchedBills([]); // Clear invoices on error
    } finally {
      setLoadingBills(false); // End loading
    }
  }, [contractId, token, yearFilter]); // Dependencies for useCallback

  // Effect to trigger invoice fetch when component mounts or when contractId, token, or yearFilter changes
  useEffect(() => {
    fetchBills(contractId, yearFilter);
  }, [fetchBills, contractId, yearFilter]); // Include yearFilter in dependencies

  // Filter and Sort bills (operates on fetchedBills)
  const filteredAndSortedBills = fetchedBills
    .filter(
      (bill) =>
        (yearFilter === "all" || bill.date.includes(yearFilter)) // Filter by year (based on date string)
    )
    .sort((a, b) => {
      if (sortBy === "date" || sortBy === "createdAt") { // Sort by creation date
        // Convert "DD/MM/YYYY" date strings to Date objects for comparison
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortBy === "amount") { // Sort by amount
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0; // Maintain order if sortBy doesn't match
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc"); // Default to descending order when changing sort column
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case "unpaid":
        return <Badge variant="outline">Chưa thanh toán</Badge>;
      case "overdue":
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // Display loading status
  if (loadingBills) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  // Display error status
  if (errorBills) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-red-600">
        <p>{errorBills}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* Lọc theo năm (chỉ năm hiện tại) */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentYear}>{currentYear}</SelectItem> {/* Chỉ hiển thị năm hiện tại */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã hóa đơn</TableHead>
              <TableHead>Kỳ hóa đơn</TableHead>
              <TableHead>
                <button className="flex items-center" onClick={() => handleSort("createdAt")}>
                  Ngày phát hành
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Tình trạng</TableHead>
              <TableHead>
                <button className="flex items-center" onClick={() => handleSort("amount")}>
                  Tổng tiền
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Tiêu thụ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBills.length > 0 ? (
              filteredAndSortedBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>{bill.period}</TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell>{bill.amount.toLocaleString()} ₫</TableCell>
                  <TableCell>{bill.consumption} m³</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`${location.pathname}/${bill.id}`}>
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy hóa đơn nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
