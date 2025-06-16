import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, FileCheck, RefreshCw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // State for selected year, default to current year
  const token = localStorage.getItem('admin_token'); // Get token from localStorage

  const API_BASE_URL = "http://localhost:8080/api/admin/dashboard/summary";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true); // Start refreshing animation

    try {
      // Construct the API endpoint with the optional year parameter
      const url = new URL(API_BASE_URL);
      if (selectedYear && selectedYear !== "all") { // Only add year if not "all"
        url.searchParams.append("year", selectedYear);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized or Forbidden access. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false); // End refreshing animation
    }
  };

  useEffect(() => {
    // Only fetch if a token exists and after selectedYear is initialized
    if (token) {
      fetchData();
    } else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token, selectedYear]); // Re-run when token or selectedYear changes

  const handleRefresh = () => {
    // fetchData is already dependent on selectedYear, so just call it
    fetchData();
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const formatCurrency = (value) => {
    // Ensure value is a number for formatting
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return "N/A";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericValue);
  };

  // Prepare data for the BarChart
  const revenueData = dashboardData?.revenueByPeriods?.map(item => ({
    period: item.periodName, // Use periodName for X-axis label
    revenue: item.totalRevenue,
    fromDate: item.fromDate // Keep fromDate for sorting
  })).sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate)) || []; // Sort by fromDate

  // Generate years for the dropdown (e.g., current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const availableYears = ["all"]; // Option to view all years
  for (let i = 0; i < 5; i++) { // Generate current year and previous 4 years
    availableYears.push((currentYear - i).toString());
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Lỗi: {error}. Vui lòng thử lại.</div>;
  }

  const displayData = dashboardData || {
    pendingRequestsCount: 0,
    unconfirmedWaterReadingsCount: 0,
    pendingInvoiceCreationCount: 0,
    latestBillingPeriodName: "N/A",
    latestBillingPeriodStatus: "N/A",
    latestBillingPeriodFromDate: "N/A",
    latestBillingPeriodToDate: "N/A",
    revenueByPeriods: [] // Ensure it's an empty array if null
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter"> {/* Apply Inter font */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - Tổng quan</h1>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="rounded-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

          <Card className="border border-yellow-200 bg-white rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yêu cầu chưa xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{displayData.pendingRequestsCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 p-1 bg-yellow-100 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-200 bg-white rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bản ghi chờ xác nhận</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{displayData.unconfirmedWaterReadingsCount}</p>
                </div>
                <FileCheck className="w-8 h-8 text-orange-600 p-1 bg-orange-100 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-white rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ tạo hóa đơn</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{displayData.pendingInvoiceCreationCount}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600 p-1 bg-purple-100 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-white lg:col-span-3 rounded-lg shadow-sm"> {/* Increased span for better layout */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kỳ thu mới nhất</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold text-green-600">{displayData.latestBillingPeriodName}</p>
                    <Badge variant={displayData.latestBillingPeriodStatus === "completed" ? "default" : "secondary"} className="rounded-full px-2 py-0.5 text-xs">
                      {displayData.latestBillingPeriodStatus === "completed" ? "Đã hoàn thành" : "Đang diễn ra"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Từ ngày: {displayData.latestBillingPeriodFromDate} | </span>
                    <span>Đến ngày: {displayData.latestBillingPeriodToDate}</span>
                  </div>
                </div>
                <FileCheck className="w-8 h-8 text-green-600 p-1 bg-green-100 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Doanh thu theo kỳ
            </CardTitle>
            {/* Year Selector */}
            <Select onValueChange={handleYearChange} value={selectedYear}>
              <SelectTrigger className="w-[120px] rounded-md">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year === "all" ? "Tất cả các năm" : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    className="text-sm text-gray-600"
                    angle={-45} // Rotate labels for better readability
                    textAnchor="end"
                    height={60} // Give more space for rotated labels
                  />
                  <YAxis
                    tickFormatter={(value) => `${(Number(value) / 1000000000).toFixed(1)}B`} // Format in Billions
                    axisLine={false}
                    tickLine={false}
                    className="text-sm text-gray-600"
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Kỳ: ${label}`}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" radius={[4, 4, 0, 0]} /> {/* Rounded top corners */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu doanh thu cho năm đã chọn.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}