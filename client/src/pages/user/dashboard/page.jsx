import  { useEffect, useState } from "react";
import React from "react";
import { useSelector } from 'react-redux'; // Import useSelector
import { useParams, Link } from 'react-router-dom'; // Import useParams and Link
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, CheckCircleIcon } from "lucide-react"; // Import CheckCircleIcon
import { WaterUsageChart } from "./water-usage-chart";
import LatestBill from "./latest-bill"; // Ensure this import path is correct
import { Skeleton } from "@/components/ui/skeleton"; // For loading states
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error messages
import { Terminal } from "lucide-react"; // For Alert icon
import { toast } from 'sonner';



export default function DashboardPage() {
  const { customerCode } = useParams(); 
  const contractId = customerCode; 

  const token = useSelector(state => state.auth.token);

  const [contractStatus, setContractStatus] = useState(null);
  const [contractPricing, setContractPricing] = useState([]);
  const [latestBill, setLatestBill] = useState(null);
  const [waterUsageData, setWaterUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChartYear, setSelectedChartYear] = useState(new Date().getFullYear()); // State for chart year

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const pricingResponse = await fetch('http://localhost:8080/api/owner/contract-types-with-pricing',{
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        },
        });
        if (!pricingResponse.ok) {
          throw new Error(`Failed to fetch contract pricing: ${pricingResponse.status}`);
        }
        const pricingData = await pricingResponse.json();
        setContractPricing(pricingData);

        if (contractId) {
          const billResponse = await fetch(`http://localhost:8080/api/owner/contracts/${contractId}/invoices/newest`,{
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        },
        }); 
          if (!billResponse.ok) {

            if (billResponse.status === 404) {
                setLatestBill(null); // No bill found, set to null
            } else {
                throw new Error(`Failed to fetch latest bill: ${billResponse.status}`);
            }
          } else {
              const billData = await billResponse.json();
              setLatestBill(billData);
          }
        }
        
        if (contractId && selectedChartYear) {
            const chartResponse = await fetch(`http://localhost:8080/api/owner/contracts/${contractId}/water-usage-chart?year=${selectedChartYear}`,{
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        },
        }); 
            if (!chartResponse.ok) {
                throw new Error(`Failed to fetch water usage chart data: ${chartResponse.status}`);
            }
            const chartData = await chartResponse.json();
            setWaterUsageData(chartData);
        }

      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [contractId, selectedChartYear]); 



  const handlePayInvoice = async (invoiceId) => {
    try {
     
      const response = await fetch('http://localhost:8080/api/owner/invoices/pay', { // Assuming /api prefix
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pay invoice: ${response.status}`);
      }
      
      toast.success('Hóa đơn đã được thanh toán thành công!'); 
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      
      if (contractId) {
          const billResponse = await fetch(`http://localhost:8080/api/owner/contracts/${contractId}/invoices/newest`,{ // Assuming /api prefix
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },  
      });
          if (billResponse.ok) {
              const billData = await billResponse.json();
              setLatestBill(billData);
          }
      }
    } catch (error) {
      console.error('Error paying invoice:', error);
      alert('Thanh toán hóa đơn thất bại.'); 
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full mb-6" /> {/* Title Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px] w-full" /> {/* Contract Status Skeleton */}
          <Skeleton className="h-[300px] w-full col-span-2" /> {/* Latest Bill Skeleton */}
          <Skeleton className="h-[300px] w-full col-span-1" /> {/* Water Pricing Skeleton */}
        </div>
        <Skeleton className="h-[400px] w-full" /> {/* Chart Skeleton */}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2"> {/* Adjusted grid layout */}

        {/* Card for Latest Bill */}
        {latestBill && ( // Only render if latestBill data is available
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Hóa đơn gần nhất</CardTitle>
              <CardDescription>Thông tin chi tiết về hóa đơn tháng {latestBill.periodName}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pass the fetched bill data and payment handler to LatestBill */}
              <LatestBill bill={latestBill} handlePayInvoice={handlePayInvoice} />
            </CardContent>
          </Card>
        )}

        {/* Card for Water Pricing Information */}
        {contractPricing.length > 0 && ( // Only render if pricing data is available
          <Card className="col-span-full md:col-span-2 lg:col-span-1"> {/* Adjust span as needed for layout */}
            <CardHeader>
              <CardTitle>Thông tin giá nước</CardTitle>
              <CardDescription>Giá nước theo loại hợp đồng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Bậc tiêu thụ</div>
                  <div className="font-medium">Giá (₫/m³)</div>
                  {contractPricing.map(contractType => (
                    // Loop through each contract type
                    <React.Fragment key={contractType.typeId}>
                      {contractType.pricingTiers.map(tier => (
                        // Loop through each pricing tier within a contract type
                        <React.Fragment key={tier.tierId}>
                          <div>{`${contractType.typeName} (${tier.minUsage}-${tier.maxUsage !== null ? tier.maxUsage : ''}m³)`}</div>
                          <div>{tier.pricePerM3.toLocaleString()}</div>
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-xs text-gray-500">* Giá chưa bao gồm thuế VAT</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Card for Water Usage Chart */}
      {waterUsageData && waterUsageData.usageByPeriods && (
        <Card>
          <CardHeader>
            <CardTitle>Lượng nước sử dụng</CardTitle>
            <CardDescription>Biểu đồ lượng nước sử dụng theo tháng/năm</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="monthly">Theo tháng</TabsTrigger>
                </TabsList>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {selectedChartYear} <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    
                    {[new Date().getFullYear()].map(year => (
                        <DropdownMenuItem key={year} onSelect={() => setSelectedChartYear(year)}>
                            {year}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <TabsContent value="monthly" className="pt-4">
                {/* Pass the relevant data to WaterUsageChart */}
                <WaterUsageChart type="monthly" data={waterUsageData.usageByPeriods} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}