// src/hooks/useRecordManagement.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { recordService } from "@/api/recordService"; // Import service
// wards và currentPeriod không còn từ mockData.js.
// Nếu wards là static, có thể định nghĩa trực tiếp hoặc từ một config file.
// currentPeriod nếu đến từ API thì cần fetch.
const wards = ["Tất cả", "Láng Thượng", "Phúc Xá", "Hai Bà Trưng", "Đống Đa"]; // Giữ nguyên cho demo

export const useRecordManagement = (itemsPerPage = 5) => {
  const [unrecordedContracts, setUnrecordedContracts] = useState([]);
  const [pendingContracts, setPendingContracts] = useState([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [unrecordedSearch, setUnrecordedSearch] = useState("");
  const [unrecordedWard, setUnrecordedWard] = useState("Tất cả"); // Ward filtering is not directly supported by current API definition for unrecorded
  const [unrecordedPage, setUnrecordedPage] = useState(0); // Page index starts from 0 for Spring Boot Pageable
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingWard, setPendingWard] = useState("Tất cả"); // Ward filtering is not directly supported by current API definition for pending
  const [pendingPage, setPendingPage] = useState(0); // Page index starts from 0

  // Pagination totals from API
  const [unrecordedTotalPages, setUnrecordedTotalPages] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);

  // --- Data Fetching ---
  const fetchUnrecordedContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recordService.getLatestReadingPeriodContracts({
        page: unrecordedPage,
        limit: itemsPerPage,
        search_owner_name: unrecordedSearch,
        // search_address: "", // API doesn't define these for unrecorded yet, add if supported
        // search_customer_code: "",
      });
      setUnrecordedContracts(data.periodContracts);
      setUnrecordedTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load unrecorded contracts.");
      toast.error("Lỗi tải hợp đồng chưa ghi: " + err.message);
      console.error("Error fetching unrecorded contracts:", err);
    } finally {
      setLoading(false);
    }
  }, [unrecordedPage, itemsPerPage, unrecordedSearch]); // Include search_owner_name in dependencies

  const fetchPendingContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recordService.getLatestPendingPeriodContracts({
        page: pendingPage,
        limit: itemsPerPage,
        search_owner_name: pendingSearch,
        // search_address: "", // API doesn't define these for pending yet, add if supported
        // search_customer_code: "",
      });
      setPendingContracts(data.periodContracts);
      setPendingTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load pending contracts.");
      toast.error("Lỗi tải hợp đồng chờ xác nhận: " + err.message);
      console.error("Error fetching pending contracts:", err);
    } finally {
      setLoading(false);
    }
  }, [pendingPage, itemsPerPage, pendingSearch]); // Include search_owner_name in dependencies

  useEffect(() => {
    fetchUnrecordedContracts();
  }, [fetchUnrecordedContracts]); // Depend on memoized fetch function

  useEffect(() => {
    fetchPendingContracts();
  }, [fetchPendingContracts]); // Depend on memoized fetch function

  // --- Handlers ---
  const handleSaveRecord = async (recordData) => {
    if (!selectedContract) {
      toast.error("Không có hợp đồng được chọn.");
      return;
    }
    try {
      // `contractPeriodId` là cần thiết để ghi bản ghi
      // `selectedContract.contractPeriodId` là trường mới từ API
      await recordService.saveMeterRecord(
      selectedContract.contractPeriodId, // Tham số thứ nhất: contractPeriodId (lấy từ state của component cha)
      recordData.assignmentId,          // Tham số thứ hai: assignmentId (lấy từ payload của RecordForm)
      recordData.newReading,            // Tham số thứ ba: newReading
      recordData.imageUrl               // Tham số thứ tư: imageUrl (lấy từ payload của RecordForm)
    );
      toast.success(`Đã lưu chỉ số cho đồng hồ ${recordData.serialNumber} của hợp đồng ${selectedContract.id}`);

      // Re-fetch data to reflect changes
      await fetchUnrecordedContracts();
      await fetchPendingContracts();

      setShowRecordForm(false);
      setSelectedContract(null);
    } catch (err) {
      toast.error("Lỗi khi lưu chỉ số: " + err.message);
      console.error("Error saving record:", err);
    }
  };

  const handleEditRecord = async (recordId, newData) => {
    try {
      await recordService.editMeterRecord(recordId, newData);
      toast.success(`Đã cập nhật bản ghi ${recordId}`);

       await fetchUnrecordedContracts();
    } catch (err) {
      toast.error("Lỗi khi chỉnh sửa bản ghi: " + err.message);
      console.error("Error editing record:", err);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await recordService.deleteMeterRecord(recordId);
      toast.success(`Đã xóa bản ghi ${recordId}`);

      // Re-fetch both as deletion might move contract back to unrecorded
      await fetchUnrecordedContracts();
      await fetchPendingContracts();
    } catch (err) {
      toast.error("Lỗi khi xóa bản ghi: " + err.message);
      console.error("Error deleting record:", err);
    }
  };

  // --- Pagination Logic (based on API's currentPage and totalPages) ---
  // API trả về page index từ 0, UI có thể hiển thị từ 1
  const displayUnrecordedPage = unrecordedPage + 1;
  const displayPendingPage = pendingPage + 1;


  return {
    unrecordedContracts,
    pendingContracts,
    showRecordForm,
    setShowRecordForm,
    selectedContract,
    setSelectedContract,
    unrecordedSearch,
    setUnrecordedSearch,
    unrecordedWard,
    setUnrecordedWard,
    unrecordedPage: displayUnrecordedPage, // Pass 1-based index to Pagination component
    setUnrecordedPage: (page) => setUnrecordedPage(page - 1), // Convert back to 0-based for API
    pendingSearch,
    setPendingSearch,
    pendingWard,
    setPendingWard,
    pendingPage: displayPendingPage, // Pass 1-based index to Pagination component
    setPendingPage: (page) => setPendingPage(page - 1), // Convert back to 0-based for API
    unrecordedTotalPages,
    pendingTotalPages,
    handleSaveRecord,
    handleEditRecord,
    handleDeleteRecord,
    filterUnrecordedLength: unrecordedContracts.length, // This will be the current page's item count
    filterPendingLength: pendingContracts.length, // This will be the current page's item count
    totalUnrecordedItems: unrecordedTotalPages > 0 ? unrecordedContracts.length : 0, // Need API to return totalElements for accurate count
    totalPendingItems: pendingTotalPages > 0 ? pendingContracts.length : 0, // Need API to return totalElements for accurate count
    loading,
    error,
  };
};