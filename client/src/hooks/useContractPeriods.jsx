import { useState, useEffect, useCallback } from "react";
import * as contractService from "@/api/contractPeriodService";
import { toast } from "sonner"; // Giả định bạn đang sử dụng sonner cho thông báo

export const useContracts = (initialItemsPerPage = 5) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchOwnerName, setSearchOwnerName] = useState(""); // Đổi từ searchTerm
  // const [selectedWard, setSelectedWard] = useState("Tất cả"); // Đã loại bỏ
  const [currentPage, setCurrentPage] = useState(0); // API sử dụng 0-indexed pages, nên state này cũng 0-indexed
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contractService.getContracts({
        searchOwnerName: searchOwnerName, // Sử dụng searchOwnerName
        // ward: selectedWard, // Đã loại bỏ
        page: currentPage, // Truyền trang 0-indexed
        limit: itemsPerPage, // Truyền limit thay vì size
      });
      setContracts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.currentPage); // Đảm bảo currentPage được đồng bộ với phản hồi API
    } catch (err) {
      console.error("Lỗi khi tải hợp đồng:", err);
      setError(err.message || "Không thể tải hợp đồng.");
      toast.error(`Lỗi khi tải dữ liệu hợp đồng: ${err.message}`);
      setContracts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [searchOwnerName, currentPage, itemsPerPage]); // Dependencies được cập nhật

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleConfirmRecord = async (contractPeriodId, readingId) => { // Tham số được cập nhật
    try {
      setLoading(true);
      await contractService.confirmMeterReading(readingId); // Gọi dịch vụ API mới
      await fetchContracts(); // Tải lại dữ liệu để cập nhật trạng thái
      toast.success("Xác nhận bản ghi thành công!");
    } catch (err) {
      console.error("Lỗi khi xác nhận bản ghi:", err);
      toast.error(`Lỗi khi xác nhận bản ghi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (contractPeriodId) => { // Tham số được cập nhật
    try {
      setLoading(true);
      await contractService.createInvoice(contractPeriodId); // Gọi dịch vụ API mới
      await fetchContracts(); // Tải lại dữ liệu để loại bỏ hóa đơn đã tạo
      toast.success(`Đã tạo hóa đơn cho hợp đồng ${contractPeriodId}`);
    } catch (err) {
      console.error("Lỗi khi tạo hóa đơn:", err);
      toast.error(`Lỗi khi tạo hóa đơn: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isAllConfirmed = (contract) => {
    return contract.meters.every((reading) => reading.isConfirmed); 
  };

  const wards = []; 

  return {
    contracts,
    loading,
    error,
    searchOwnerName, // Export state tìm kiếm mới
    setSearchOwnerName, // Export setter
    currentPage, // 0-indexed
    setCurrentPage: (page) => setCurrentPage(page - 1), 
    totalPages,
    totalElements,
    itemsPerPage,
    setItemsPerPage,
    handleConfirmRecord,
    handleCreateInvoice,
    isAllConfirmed,
    wards, 
    fetchContracts
  };
};