import { useState, useEffect, useCallback } from 'react';
import employeeService from '@/api/employeeService';
import { setAuthToken } from '../utils/api'; 
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('admin_token');
 


  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(null); // 'all', 'active', 'inactive'
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog/Modal states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toggleEmployeeStatusConfirmId, setToggleEmployeeStatusConfirmId] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.getEmployees({
        page: currentPage,
        searchTerm: searchTerm,
        isActive : isActiveFilter,
      });
      setEmployees(response.content);
      setTotalEmployees(response.totalElements);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, isActiveFilter]);

  useEffect(() => {
    setAuthToken(token);
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleIsActiveFilterChange = (value) => {
    setIsActiveFilter(value === "active" ? true : value === "inactive" ? false : null);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddEmployee = async (formData) => {
    try {
      await employeeService.addEmployee(formData);
      toast.success('Thêm nhân viên thành công!');
      setIsAddDialogOpen(false);
      fetchEmployees(); // Re-fetch employees to update list
    } catch (err) {
      // Error already handled by service, just log/handle UI specific if needed
      console.error("Failed to add employee:", err);
    }
  };

  const handleEditEmployee = async (id, formData) => {
    try {
      await employeeService.updateEmployee(id, formData);
      toast.success('Cập nhật nhân viên thành công!');
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees(); // Re-fetch employees to update list
    } catch (err) {
      console.error("Failed to edit employee:", err);
    }
  };


  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await employeeService.toggleEmployeeStatus(id, currentStatus);
      setToggleEmployeeStatusConfirmId(null);
      fetchEmployees();
    } catch (err) {
      console.error("Failed to toggle employee status:", err);
    }
  };

  // Dialog open/close handlers
  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => setIsAddDialogOpen(false);

  const openEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const openViewDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };
  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedEmployee(null);
  };


  const openToggleStatusConfirm = (id) => setToggleEmployeeStatusConfirmId(id);
  const closeToggleStatusConfirm = () => setToggleEmployeeStatusConfirmId(null);

  const totalPages = Math.ceil(totalEmployees / ITEMS_PER_PAGE);

  return {
    employees,
    totalEmployees,
    loading,
    error,
    searchTerm,
    isActiveFilter,
    currentPage,
    totalPages,
    selectedEmployee,
    isAddDialogOpen,
    isEditDialogOpen,
    isViewDialogOpen,
    toggleEmployeeStatusConfirmId,
    handleSearchChange,
    handleIsActiveFilterChange,
    handlePageChange,
    handleAddEmployee,
    handleEditEmployee,
    handleToggleStatus,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openViewDialog,
    closeViewDialog,
    openToggleStatusConfirm,
    closeToggleStatusConfirm,
    // Add helper for role display
    getRoleDisplayText: employeeService.getRoleDisplayText,
    getRoleOptions: employeeService.getRoleOptions,
  };
}