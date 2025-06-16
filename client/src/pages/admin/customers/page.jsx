import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import { useCustomerData } from "../../../hooks/useCustomers"

// Import Sonner components and toast function
import { Toaster, toast } from 'sonner'

import { AddCustomerForm } from "../../../components/customers/AddCustomersForm"
import { EditCustomerForm } from "../../../components/customers/EditCustomerForm"
import { ViewCustomerDetails } from "../../../components/customers/ViewCustomerDetail"
import { CustomerFilter } from "../../../components/customers/CustomerFilter"
import { CustomerTable } from "../../../components/customers/CustomerTable"
import { DeleteCustomerAlertDialog } from "../../../components/customers/DeleteCustomerAlertDialog"
import { ToggleCustomerStatusAlertDialog } from "../../../components/customers/ToggleCustomerStatusAlertDialog"

export default function CustomersPage() {
  const navigate = useNavigate()

  const {
    customers,
    totalCustomers,
    totalPages,
    currentPage,
    searchTerm,
    statusFilter,
    loadingList,
    errorList,
    setSearchTerm,
    setStatusFilter,
    setCurrentPage,
    addCustomer,
    editCustomer,
    deleteCustomer,
    toggleStatus,

    selectedCustomerId,
    customerDetails,
    customerContracts,
    loadingDetails,
    errorDetails,
    viewCustomer,
    clearCustomerView,
  } = useCustomerData()

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editCustomerData, setEditCustomerData] = useState(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState(null)
  const [toggleCustomerId, setToggleCustomerId] = useState(null)

  const handleEdit = (customer) => {
    setEditCustomerData(customer)
  }

  const handleView = (customer) => {
    viewCustomer(customer.ownerId)
  }

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteCustomer(id)
      toast.success("Xóa khách hàng thành công!")
      setDeleteCustomerId(null) // Close modal on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi xóa khách hàng.";
      toast.error(errorMessage);
      // Keep modal open on error, allowing user to retry or understand the issue
    }
  }

  const handleToggleStatusConfirm = async (id) => {
    const customerToToggle = customers.find(c => c.ownerId === id);
    if (!customerToToggle) {
        toast.error("Không tìm thấy khách hàng để thay đổi trạng thái.");
        setToggleCustomerId(null);
        return;
    }
    try {
      await toggleStatus(id, customerToToggle.isActive)
      const newStatus = !customerToToggle.isActive ? "kích hoạt" : "vô hiệu hóa";
      toast.success(`Cập nhật trạng thái khách hàng thành công: đã ${newStatus}.`);
      setToggleCustomerId(null) // Close modal on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi cập nhật trạng thái khách hàng.";
      toast.error(errorMessage);
      // Keep modal open on error
    }
  }

  const handleAddCustomerSave = async (customerData) => {
    try {
      await addCustomer(customerData);
      toast.success("Thêm khách hàng thành công!");
      setIsAddModalOpen(false); // Close modal on success
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi thêm khách hàng.";
      toast.error(errorMessage);
      // Keep modal open on error
    }
  };

  const handleEditCustomerSave = async ( id, customerData) => {
    try {
      await editCustomer(id, customerData);
      toast.success("Cập nhật khách hàng thành công!");
      setEditCustomerData(null); // Close modal on success
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi cập nhật khách hàng.";
      toast.error(errorMessage);
      // Keep modal open on error
    }
  };

  const handleViewContract = (contractId) => {
    navigate(`/admin/contracts/${contractId}`)
    clearCustomerView() 
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">


        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Khách hàng</h1>
        </div>

        <CustomerFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAddCustomerClick={() => setIsAddModalOpen(true)}
        />

        {loadingList && <p className="text-center text-gray-500">Đang tải dữ liệu khách hàng...</p>}
        {errorList && <p className="text-center text-red-500">{errorList}</p>} {/* Display initial load error */}

        {!loadingList && !errorList && (
          <CustomerTable
            customers={customers}
            totalCustomers={totalCustomers}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onEdit={handleEdit}
            onView={handleView}
            onToggleStatus={setToggleCustomerId}
            onDelete={setDeleteCustomerId}
          />
        )}

        {/* Add Customer Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm khách hàng mới</DialogTitle>
            </DialogHeader>
            <AddCustomerForm onClose={() => setIsAddModalOpen(false)} onSave={handleAddCustomerSave} />
          </DialogContent>
        </Dialog>

        {/* Edit Customer Modal */}
        <Dialog open={!!editCustomerData} onOpenChange={() => setEditCustomerData(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            </DialogHeader>
            <EditCustomerForm
              customer={editCustomerData}
              onClose={() => setEditCustomerData(null)}
              onSave={handleEditCustomerSave}
            />
          </DialogContent>
        </Dialog>

        {/* View Customer Details Modal */}
        <Dialog open={!!selectedCustomerId} onOpenChange={clearCustomerView} >
          <DialogContent className="max-w-1xl">
            <DialogHeader>
              <DialogTitle>Chi tiết thông tin khách hàng</DialogTitle>
            </DialogHeader>
            {loadingDetails ? (
              <p className="text-center">Đang tải chi tiết khách hàng và hợp đồng...</p>
            ) : errorDetails ? (
              <p className="text-center text-red-500">{errorDetails}</p>
            ) : (
              <ViewCustomerDetails
                customer={customerDetails}
                contracts={customerContracts}
                onClose={clearCustomerView}
                onViewContract={handleViewContract}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Customer Alert Dialog */}
        <DeleteCustomerAlertDialog
          customerId={deleteCustomerId}
          isOpen={!!deleteCustomerId}
          onClose={() => setDeleteCustomerId(null)}
          onConfirm={handleDeleteConfirm}
        />

        {/* Toggle Customer Status Alert Dialog */}
        <ToggleCustomerStatusAlertDialog
          customerId={toggleCustomerId}
          customersData={customers}
          isOpen={!!toggleCustomerId}
          onClose={() => setToggleCustomerId(null)}
          onConfirm={handleToggleStatusConfirm}
        />
      </div>
    </TooltipProvider>
  )
}