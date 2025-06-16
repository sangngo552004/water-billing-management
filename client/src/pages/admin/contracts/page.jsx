import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";


// Import API calls
import { getContracts, suspendContract, cancelContract, activateContract, addContract } from "../../../api/contract";
import { getContractTypes, getPricingTiers, addContractTypeAndTiers, updateContractType, updatePricingTiers, deleteContractType } from "../../../api/contractType";

// Import components
import ContractList from "../../../components/contracts/ContractList";
import AddContractDialog from "../../../components/contracts/AddContractDialog";
import ContractActions from "../../../components/contracts/ContractAction";
import ContractTypeManagement from "../../../components/contract-types/ContractTypeManagement";
import PricingTierHistory from "../../../components/contract-types/PricingTierHistory";
import AddContractTypeAndTiersDialog from "../../../components/contract-types/AddContractTypeAndTiersDialog";
import EditContractTypeDialog from "../../../components/contract-types/EditContractTypeDialog";
import EditPriceFormDialog from "../../../components/contract-types/EditPriceFormDialog";



const ITEMS_PER_PAGE = 10;

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [totalContracts, setTotalContracts] = useState(0);
  const [contractTypes, setContractTypes] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [suspendContractId, setSuspendContractId] = useState(null);
  const [cancelContractId, setCancelContractId] = useState(null);
  const [activateContractId, setActivateContractId] = useState(null);

  const [selectedContractType, setSelectedContractType] = useState(null);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [deleteTypeId, setDeleteTypeId] = useState(null);
  const [deleteTierId, setDeleteTierId] = useState(null); // Assuming you have a deleteTierId state for pricing tiers
  const [editPriceTypeId, setEditPriceTypeId] = useState(null);

  // Helper to extract error message
  const getErrorMessage = (error) => {
    return error.response?.data?.message || error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
  };

  // Fetch Contracts
  const fetchContracts = useCallback(async () => {
    setIsLoadingContracts(true);
    try {
      const response = await getContracts({
        searchTerm,
        statusFilter,
        currentPage,
      });
      setContracts(response.data);
      setTotalContracts(response.totalCount);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error(getErrorMessage(error)); // Updated
    } finally {
      setIsLoadingContracts(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  // Fetch Contract Types
  const fetchContractTypes = useCallback(async () => {
    try {
      const data = await getContractTypes();
      setContractTypes(data);
    } catch (error) {
      console.error("Error fetching contract types:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  }, []);

  // Fetch Pricing Tiers
  const fetchPricingTiers = useCallback(async (typeId = null) => {
    try {
      const data = await getPricingTiers(typeId);
      setPricingTiers(data);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    fetchContractTypes();
  }, [fetchContractTypes]);

  useEffect(() => {
    fetchPricingTiers(selectedContractType);
  }, [fetchPricingTiers, selectedContractType]);

  const handleAddContract = async (newContractData) => {
    console.log("New contract data:", newContractData);
    try {
      await addContract(newContractData);
      toast.success("Thêm hợp đồng mới thành công");
      setIsAddContractOpen(false);
      fetchContracts();
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleSuspendContract = async (contractId) => {
    try {
      await suspendContract(contractId);
      setSuspendContractId(null);
      fetchContracts();
      toast.success("Tạm ngừng hợp đồng thành công");
    } catch (error) {
      console.error("Error suspending contract:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleCancelContract = async (contractId) => {
    try {
      await cancelContract(contractId);
      setCancelContractId(null);
      fetchContracts();
      toast.success("Hủy hợp đồng thành công");
    } catch (error) {
      console.error("Error canceling contract:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleActivateContract = async (contractId) => {
    try {
      await activateContract(contractId);
      setActivateContractId(null);
      fetchContracts();
      toast.success("Kích hoạt hợp đồng thành công");
    } catch (error) {
      console.error("Error activating contract:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleAddContractTypeAndTiers = async (data) => {
    try {
      await addContractTypeAndTiers(data);
      setIsAddTypeOpen(false);
      fetchContractTypes();
      fetchPricingTiers(selectedContractType);
      toast.success("Thêm loại hợp đồng và tầng giá thành công");
    } catch (error) {
      console.error("Error adding contract type and tiers:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleUpdateContractType = async (typeId, data) => {
    try {
      await updateContractType(typeId, data);
      setEditingType(null);
      fetchContractTypes();
      toast.success("Cập nhật loại hợp đồng thành công");
    } catch (error) {
      console.error("Error updating contract type:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleUpdatePricingTiers = async (contractTypeId, newTiers) => {
    try {
      await updatePricingTiers(contractTypeId, newTiers);
      setEditPriceTypeId(null);
      fetchPricingTiers(contractTypeId);
      toast.success("Cập nhật tầng giá thành công");
    } catch (error) {
      console.error("Error updating pricing tiers:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  const handleDeleteContractType = async (typeId) => {
    try {
      await deleteContractType(typeId);
      setDeleteTypeId(null);
      fetchContractTypes();
      fetchPricingTiers(selectedContractType);
      toast.success("Xóa loại hợp đồng thành công");
    } catch (error) {
      console.error("Error deleting contract type:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };

  // Assuming you have a handleDeletePricingTier function as well
  const handleDeletePricingTier = async (tierId) => {
    try {
      // Add your API call to delete the pricing tier here
      // For example: await deletePricingTier(tierId);
      console.log(`Deleting pricing tier with ID: ${tierId}`); // Placeholder
      setDeleteTierId(null);
      fetchPricingTiers(selectedContractType); // Refresh pricing tiers
      toast.success("Xóa tầng giá thành công");
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
      toast.error(getErrorMessage(error)); // Updated
    }
  };


  const totalPages = Math.ceil(totalContracts / ITEMS_PER_PAGE);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm ngừng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hợp đồng</h1>
        </div>

        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contracts">Danh sách hợp đồng</TabsTrigger>
            <TabsTrigger value="types">Loại hợp đồng và tầng giá</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo mã khách hàng, tên, địa chỉ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="suspended">Tạm ngừng</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setIsAddContractOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm hợp đồng
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tạo hợp đồng mới cho khách hàng</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            <ContractList
              contracts={contracts}
              totalContracts={totalContracts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onViewContract={(id) => navigate(`${id}`)}
              onSuspendContract={setSuspendContractId}
              onCancelContract={setCancelContractId}
              onActivateContract={setActivateContractId}
              getStatusBadge={getStatusBadge}
              isLoading={isLoadingContracts}
            />
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContractTypeManagement
                contractTypes={contractTypes}
                selectedContractType={selectedContractType}
                setSelectedContractType={setSelectedContractType}
                onAddType={() => setIsAddTypeOpen(true)}
                onEditType={setEditingType}
                onEditPriceType={setEditPriceTypeId}
                onDeleteType={setDeleteTypeId}
              />
              <PricingTierHistory
                selectedContractType={selectedContractType}
                contractTypes={contractTypes}
                pricingTiers={pricingTiers}
                onEditTier={setEditingTier}
                onDeleteTier={setDeleteTierId}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals and AlertDialogs */}
        <AddContractDialog
          isOpen={isAddContractOpen}
          onClose={() => setIsAddContractOpen(false)}
          onSave={handleAddContract}
        />

        <AddContractTypeAndTiersDialog
          isOpen={isAddTypeOpen}
          onClose={() => setIsAddTypeOpen(false)}
          onSave={handleAddContractTypeAndTiers}
        />

        <EditContractTypeDialog
          type={editingType}
          onClose={() => setEditingType(null)}
          onSave={handleUpdateContractType}
        />

        <EditPriceFormDialog
          contractTypeId={editPriceTypeId}
          onClose={() => setEditPriceTypeId(null)}
          onSave={handleUpdatePricingTiers}
          allPricingTiers={pricingTiers}
        />

        <ContractActions
          suspendContractId={suspendContractId}
          setSuspendContractId={setSuspendContractId}
          handleSuspendContract={handleSuspendContract}
          activateContractId={activateContractId}
          setActivateContractId={setActivateContractId}
          handleActivateContract={handleActivateContract}
          cancelContractId={cancelContractId}
          setCancelContractId={setCancelContractId}
          handleCancelContract={handleCancelContract}
        />

        {/* Delete Type Confirmation */}
        <AlertDialog open={!!deleteTypeId} onOpenChange={() => setDeleteTypeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa loại hợp đồng</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa loại hợp đồng này? Thao tác này sẽ xóa tất cả các tầng giá liên quan và không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTypeId && handleDeleteContractType(deleteTypeId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa loại hợp đồng
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Tier Confirmation */}
        <AlertDialog open={!!deleteTierId} onOpenChange={() => setDeleteTierId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa tầng giá</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa tầng giá này? Thao tác này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTierId && handleDeletePricingTier(deleteTierId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa tầng giá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}