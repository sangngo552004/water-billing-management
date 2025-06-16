import { useState, useEffect, useCallback } from "react";
import * as periodService from "@/api/periodService";
import {toast} from "sonner"; // Hoặc import { useToast } from "@/components/ui/use-toast" nếu dùng shadcn/ui toast

// Dữ liệu mock cho các bộ lọc và trạng thái (cập nhật theo yêu cầu của bạn)
export const PERIOD_FILTER_DATA = {
  years: ["Tất cả", "2025"],

};

export const usePeriods = (initialItemsPerPage = 10) => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Vẫn giữ error state cho trường hợp cần hiển thị cụ thể

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const [selectedMonth, setSelectedMonth] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await periodService.getPeriods({
        page: currentPage - 1,
        size: itemsPerPage,
        searchTerm,
      });
      setPeriods(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch periods:", err);
      setError(err.message); // Cập nhật error state
      toast.error(`Lỗi khi tải dữ liệu kỳ: ${err.message}`); // Hiển thị toast lỗi
      setPeriods([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);


  const addPeriod = useCallback(async (periodData) => {
    setLoading(true);
    setError(null);
    try {
      const apiData = {
        periodName: periodData.name, // Đổi từ 'name' sang 'periodName'
        toDate: periodData.toDate,

      };
      await periodService.createPeriod(apiData);
      await fetchPeriods();
      toast.success("Thêm kỳ mới thành công!");
    } catch (err) {
      console.error("Failed to add period:", err);
      setError(`Failed to add period: ${err.message}`);
      toast.error(`Lỗi khi thêm kỳ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPeriods]);

  const updatePeriod = useCallback(async (id, periodData) => {
    setLoading(true);
    setError(null);
    try {
      // Điều chỉnh tên trường dữ liệu gửi đi cho phù hợp với API backend
      const apiData = {
        periodName: periodData.name, // Đổi từ 'name' sang 'periodName'
        toDate: periodData.toDate,
      };
      await periodService.updatePeriod(id, apiData);
      await fetchPeriods();
      toast.success("Cập nhật kỳ thành công!");
    } catch (err) {
      console.error("Failed to update period:", err);
      setError(`Failed to update period: ${err.message}`);
      toast.error(`Lỗi khi cập nhật kỳ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPeriods]);

  const removePeriod = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await periodService.deletePeriod(id);
      await fetchPeriods();
      toast.success("Xóa kỳ thành công!");
    } catch (err) {
      console.error("Failed to delete period:", err);
      setError(`Failed to delete period: ${err.message}`);
      toast.error(`Lỗi khi xóa kỳ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPeriods]);

  const markPeriodAsComplete = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await periodService.completePeriod(id);
      await fetchPeriods();
      toast.success("Kỳ đã được hoàn thành!");
    } catch (err) {
      console.error("Failed to complete period:", err);
      setError(`Failed to complete period: ${err.message}`);
      toast.error(`Lỗi khi hoàn thành kỳ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    itemsPerPage,
    searchTerm,
    selectedYear,
    selectedMonth,
    selectedStatus,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setSelectedYear,
    setSelectedMonth,
    setSelectedStatus,
    fetchPeriods,
    addPeriod,
    updatePeriod,
    removePeriod,
    markPeriodAsComplete,
  };
};