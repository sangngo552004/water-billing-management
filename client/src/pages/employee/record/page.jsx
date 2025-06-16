
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

// Imported components and hooks
import { RecordForm } from "@/components/records/RecordForm";
import { Pagination } from "@/components/ui/Pagination";
import { ContractDetailDialog } from "@/components/records/ContractDetailDialog";
import { FilterAndSearch } from "@/components/records/FilterAndSearch";
import { useRecordManagement } from "@/hooks/useRecordManagement";

export default function RecordPage() {
  const {
    unrecordedContracts, 
    pendingContracts,    
    showRecordForm,
    setShowRecordForm,
    selectedContract,
    setSelectedContract,
    unrecordedSearch,    // Search/filter cho hợp đồng ĐÃ GHI, CHỜ XÁC NHẬN
    setUnrecordedSearch,
    unrecordedWard,
    setUnrecordedWard,
    unrecordedPage,
    setUnrecordedPage,
    pendingSearch,       // Search/filter cho hợp đồng CHƯA GHI
    setPendingSearch,
    pendingWard,
    setPendingWard,
    pendingPage,
    setPendingPage,
    unrecordedTotalPages, // Total pages cho hợp đồng ĐÃ GHI, CHỜ XÁC NHẬN
    pendingTotalPages,    // Total pages cho hợp đồng CHƯA GHI
    handleSaveRecord,
    handleEditRecord,
    handleDeleteRecord,
    totalUnrecordedItems, // Total items cho hợp đồng ĐÃ GHI, CHỜ XÁC NHẬN
    totalPendingItems,    // Total items cho hợp đồng CHƯA GHI
    loading,
    error,
  } = useRecordManagement();

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>;
  }

  // Error handling can be enhanced (e.g., retry button)
  if (error) {
    return <div className="text-center py-10 text-red-600">Đã xảy ra lỗi: {error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
  
          <h1 className="text-2xl font-bold text-gray-900">Ghi chỉ số nước</h1>
          <p className="text-gray-600">Ghi chỉ số nước cho các hợp đồng</p>
        </div>
        {/* Nút reset mock data không còn cần thiết khi dùng API thực */}
        {/* <Button onClick={resetMockData} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reset Dữ liệu Mock
        </Button> */}
      </div>

      <Tabs defaultValue="pending"  className="space-y-4">
        <TabsList className="bg-green-50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Chưa ghi ({totalPendingItems}) {/* Đã đổi từ totalUnrecordedItems sang totalPendingItems */}
          </TabsTrigger>
          <TabsTrigger value="unrecorded" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Chờ xác nhận ({totalUnrecordedItems}) {/* Đã đổi từ totalPendingItems sang totalUnrecordedItems */}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách hợp đồng chưa ghi</CardTitle>
              <FilterAndSearch
                searchQuery={pendingSearch} // Đã đổi từ unrecordedSearch sang pendingSearch
                onSearchChange={setPendingSearch} // Đã đổi từ setUnrecordedSearch sang setPendingSearch
                wardFilter={pendingWard}       // Đã đổi từ unrecordedWard sang pendingWard
                onWardChange={setPendingWard}  // Đã đổi từ setUnrecordedWard sang setPendingWard
                placeholder="Tìm kiếm theo tên khách hàng hoặc mã hợp đồng..."
              />
            </CardHeader>
            <CardContent>
              {pendingContracts.length > 0 ? ( // Đã đổi từ unrecordedContracts sang pendingContracts
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Tên khách hàng</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Số đồng hồ</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingContracts.map((contract) => ( // Đã đổi từ unrecordedContracts.map sang pendingContracts.map
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.id}</TableCell>
                          <TableCell>{contract.customerName}</TableCell>
                          <TableCell>{contract.address}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.meters.length} đồng hồ</Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={showRecordForm && selectedContract?.id === contract.id}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) {
                                  setShowRecordForm(false);
                                  setSelectedContract(null);
                                } else {
                                  setSelectedContract(contract);
                                  setShowRecordForm(true);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedContract(contract)}
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                >
                                  📝 Ghi
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl">
                                <DialogHeader>
                                  <DialogTitle>Ghi chỉ số nước - {selectedContract?.id}</DialogTitle>
                                </DialogHeader>
                                <RecordForm
                                  contract={selectedContract}
                                  onSave={handleSaveRecord}
                                  onCancel={() => {
                                    setShowRecordForm(false);
                                    setSelectedContract(null);
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <Pagination
                      currentPage={pendingPage} // Đã đổi từ unrecordedPage sang pendingPage
                      totalPages={pendingTotalPages} // Đã đổi từ unrecordedTotalPages sang pendingTotalPages
                      onPageChange={setPendingPage} // Đã đổi từ setUnrecordedPage sang setPendingPage
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {pendingSearch || pendingWard !== "Tất cả" // Đã đổi từ unrecordedSearch || unrecordedWard sang pendingSearch || pendingWard
                    ? "Không tìm thấy hợp đồng nào phù hợp."
                    : "Hiện chưa có hợp đồng nào chưa ghi chỉ số."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unrecorded">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách hợp đồng chờ xác nhận</CardTitle>
              <FilterAndSearch
                searchQuery={unrecordedSearch} // Đã đổi từ pendingSearch sang unrecordedSearch
                onSearchChange={setUnrecordedSearch} // Đã đổi từ setPendingSearch sang setUnrecordedSearch
                wardFilter={unrecordedWard}       // Đã đổi từ pendingWard sang unrecordedWard
                onWardChange={setUnrecordedWard}  // Đã đổi từ setPendingWard sang setUnrecordedWard
                placeholder="Tìm kiếm theo tên khách hàng hoặc mã hợp đồng..."
              />
            </CardHeader>
            <CardContent>
              {unrecordedContracts.length > 0 ? ( // Đã đổi từ pendingContracts sang unrecordedContracts
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Tên khách hàng</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Số bản ghi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unrecordedContracts.map((contract) => ( // Đã đổi từ pendingContracts.map sang unrecordedContracts.map
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.id}</TableCell>
                          <TableCell>{contract.customerName}</TableCell>
                          <TableCell>{contract.address}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.waterMeterReadings.length} bản ghi</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {contract.allConfirmed ? (
                                <Badge className="bg-green-600">Đã xác nhận</Badge>
                              ) : (
                                <Badge variant="secondary">Chờ xác nhận</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ContractDetailDialog
                              contract={contract}
                              handleEditRecord={handleEditRecord}
                              handleDeleteRecord={handleDeleteRecord}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <Pagination
                      currentPage={unrecordedPage} // Đã đổi từ pendingPage sang unrecordedPage
                      totalPages={unrecordedTotalPages} // Đã đổi từ pendingTotalPages sang unrecordedTotalPages
                      onPageChange={setUnrecordedPage} // Đã đổi từ setPendingPage sang setUnrecordedPage
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {unrecordedSearch || unrecordedWard !== "Tất cả" // Đã đổi từ pendingSearch || pendingWard sang unrecordedSearch || unrecordedWard
                    ? "Không tìm thấy hợp đồng nào phù hợp."
                    : "Chưa có hợp đồng nào chờ xác nhận."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}