import { useState, useEffect, useCallback } from "react";
import { customerService } from "../api/customerService";
import { setAuthToken } from '../utils/api'; 

const ITEMS_PER_PAGE = 10;

export const useCustomerData = () => {
  // State for Customer List
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState(null); // For initial list load errors
  const token = localStorage.getItem('admin_token');


  // State for Customer Details View
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerContracts, setCustomerContracts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null); // For detail load errors


  // --- Customer List Management (includes initial fetch and re-fetches after CRUD) ---

  const fetchCustomers = useCallback(async () => {
    setLoadingList(true);
    setErrorList(null); // Clear previous errors for list fetch
    try {
      const response = await customerService.getAllCustomers({
        searchTerm,
        isActive: statusFilter === "all" ? null : statusFilter === "active",
        page: currentPage,
      });
      setCustomers(response.content);
      setTotalCustomers(response.totalElements);
    } catch (err) {
      setErrorList("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
      console.error("Fetch customers error:", err);
    } finally {
      setLoadingList(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    setAuthToken(token)
    fetchCustomers();
  }, [fetchCustomers]);

  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

  // CRUD operations that will be called from page.jsx.
  // These will *throw* errors for the page.jsx to catch and display via toast.
  const addCustomer = async (customerData) => {
    setLoadingList(true); // Indicate loading for list affected
    try {
      const newCustomer = await customerService.addCustomer(customerData);
      await fetchCustomers(); // Re-fetch list to show new customer
      return newCustomer;
    } finally {
      // Loading state might be reset by fetchCustomers on success, but ensure it's cleared on error too.
      // Or, let page.jsx handle setting loading states for specific actions if preferred.
      setLoadingList(false); // Reset regardless of success/fail
    }
  };

  const editCustomer = async (id, customerData) => {
    setLoadingList(true);
    try {
      const updatedCustomer = await customerService.updateCustomer(id, customerData);
      await fetchCustomers();
      return updatedCustomer;
    } finally {
      setLoadingList(false);
    }
  };

  const deleteCustomer = async (id) => {
    setLoadingList(true);
    try {
      await customerService.deleteCustomer(id);
      await fetchCustomers();
    } finally {
      setLoadingList(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setLoadingList(true);
    try {
      await customerService.toggleCustomerStatus(id, !currentStatus);
      await fetchCustomers();
    } finally {
      setLoadingList(false);
    }
  };


  // --- Customer Details Management ---

  const fetchCustomerDetails = useCallback(async () => {
    if (!selectedCustomerId) {
      setCustomerDetails(null);
      setCustomerContracts([]);
      return;
    }

    setLoadingDetails(true);
    setErrorDetails(null); // Clear previous errors for detail fetch
    try {
      const customer = await customerService.getCustomerDetails(selectedCustomerId);
      setCustomerDetails(customer);

      const contracts = await customerService.getContractsByCustomerId(selectedCustomerId);
      setCustomerContracts(contracts);
    } catch (err) {
      setErrorDetails("Không thể tải chi tiết khách hàng hoặc hợp đồng. Vui lòng thử lại.");
      console.error("Fetch customer details error:", err);
      setCustomerDetails(null);
      setCustomerContracts([]); // Clear data on error
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const viewCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const clearCustomerView = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null); // Clear details when modal is closed
    setCustomerContracts([]);
  };

  return {
    // List state and functions
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
    fetchCustomers,

    // Detail state and functions
    selectedCustomerId,
    customerDetails,
    customerContracts,
    loadingDetails,
    errorDetails,
    viewCustomer,
    clearCustomerView,
  };
};