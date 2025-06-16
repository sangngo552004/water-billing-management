import { useState, useEffect, useCallback } from 'react';
import requestService from '@/api/requestService'; // Import service
import { setAuthToken } from '../utils/api'; 
import { toast } from 'sonner';


const ITEMS_PER_PAGE = 10;

export function useRequests() {
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('admin_token');
 


  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Pending', 'Approved', 'Rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Thay đổi thông tin', etc.
  const [currentPage, setCurrentPage] = useState(1);
   const [loadingDetails, setLoadingDetails] = useState(false); // Thêm state loading cho chi tiết
  const [detailsError, setDetailsError] = useState(null); 

  // Dialog/Modal states
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmApproveId, setConfirmApproveId] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestService.getRequests({
        page: currentPage,
        searchTerm,
        status: statusFilter === 'all' ? "" : statusFilter,
        requestType: typeFilter === 'all' ? "" : typeFilter,
      });
      setRequests(response.content);
      setTotalRequests(response.totalElements);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách yêu cầu")
      setError(err);
      // Toast already handled by service
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
        setAuthToken(token)
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApproveRequest = async (id) => {
    try {
      await requestService.approveRequest(id);
      toast.success("Duyệt yêu cầu thành công");
      setConfirmApproveId(null);
      fetchRequests(); // Re-fetch to update status
    } catch (err) {
      // Error already handled by service
      toast.error("Lỗi khi duyệt yêu cầu:" + err.message)
      console.error("Failed to approve request:", err);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await requestService.rejectRequest(id);
      toast.success("Từ chối yêu cầu thành công");
      setConfirmRejectId(null);
      fetchRequests(); // Re-fetch to update status
    } catch (err) {
      // Error already handled by service
      toast.error("Lỗi khi từ chối yêu cầu:" + err.message)
      console.error("Failed to reject request:", err);
    }
  };

  // View Details handlers
 const openViewDetailsDialog = useCallback(async (requestSummary) => {
    setLoadingDetails(true); // Bắt đầu tải chi tiết
    setDetailsError(null);   // Xóa lỗi cũ
    setSelectedRequest(null); // Xóa dữ liệu chi tiết cũ nếu có
    setIsViewDetailsDialogOpen(true); // Mở dialog ngay để hiển thị loading

    try {
      const fullRequestDetails = await requestService.getRequestById(requestSummary.requestId);
      setSelectedRequest(fullRequestDetails);
    } catch (err) {
      console.error("Failed to fetch full request details:", err);
      setDetailsError(err);
      toast.error(`Không thể tải chi tiết yêu cầu: ${requestSummary.id}.`); // Thông báo lỗi riêng cho việc tải chi tiết
    } finally {
      setLoadingDetails(false); // Kết thúc tải chi tiết
    }
  }, []); 

  const closeViewDetailsDialog = () => {
    setIsViewDetailsDialogOpen(false);
    setSelectedRequest(null);
  };

  // Confirmation dialog handlers
  const openApproveConfirm = (id) => setConfirmApproveId(id);
  const closeApproveConfirm = () => setConfirmApproveId(null);

  const openRejectConfirm = (id) => setConfirmRejectId(id);
  const closeRejectConfirm = () => setConfirmRejectId(null);


  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);

  return {
    requests,
    totalRequests,
    loading,
    error,
    searchTerm,
    statusFilter,
    typeFilter,
    currentPage,
    totalPages,
    selectedRequest,
    isViewDetailsDialogOpen,
    confirmApproveId,
    confirmRejectId,
    loadingDetails, // Trả về state loading chi tiết
    detailsError,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handlePageChange,
    handleApproveRequest,
    handleRejectRequest,
    openViewDetailsDialog,
    closeViewDetailsDialog,
    openApproveConfirm,
    closeApproveConfirm,
    openRejectConfirm,
    closeRejectConfirm,
    // Provide helper for request types from service
    getRequestTypes: requestService.getRequestTypes,
  };
}