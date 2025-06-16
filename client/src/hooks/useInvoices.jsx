import { useState, useEffect, useCallback } from "react";
import { invoiceService } from "@/api/invoiceService"; // Điều chỉnh đường dẫn nếu cần

export const useInvoices = (initialFilters = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [billingPeriods, setBillingPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    billingPeriodId: initialFilters.billingPeriodId || null,
    searchTerm: initialFilters.searchTerm || "",
    status: initialFilters.status || "all",
    sortBy: initialFilters.sortBy || "createdAt",
    sortDir: initialFilters.sortDir || "desc",
  });

  const fetchBillingPeriods = useCallback(async () => {
    try {
      const data = await invoiceService.getBillingPeriods();
      // Giả định cấu trúc API trả về là một mảng các đối tượng có id và name
      // Nếu API trả về trực tiếp mảng chuỗi tên kỳ, bạn có thể map lại cho phù hợp
      setBillingPeriods(data.map(period => ({ id: period.periodId, name: `Kỳ ${period.periodName}` })));
    } catch (err) {
      setError(err);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getInvoicesForAdmin({
        ...filters,
        page: pagination.page,
        size: pagination.size,
      });
      setInvoices(data.content);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  useEffect(() => {
    fetchBillingPeriods();
  }, [fetchBillingPeriods]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const cancelInvoice = async (invoiceId) => {
    try {
      await invoiceService.cancelInvoice(invoiceId);
      fetchInvoices(); // Refresh list after cancellation
    } catch (err) {
      // Error handled by service, no need to set local error state again
    }
  };

  // Chức năng recreateInvoice đã được bỏ đi khỏi hook

  const getInvoiceDetail = useCallback(async (invoiceId) => {
    try {
      const detail = await invoiceService.getInvoiceDetail(invoiceId);
      return detail;
    } catch (err) {
      return null;
    }
  }, []);

  return {
    invoices,
    billingPeriods,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setFilter,
    cancelInvoice,
    // recreateInvoice, // Loại bỏ recreateInvoice khỏi export
    getInvoiceDetail,
    fetchInvoices,
  };
};