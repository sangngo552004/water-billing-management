// hooks/useCollectInvoices.jsx
import { useState, useEffect, useCallback } from "react";
import { collectInvoiceService } from "@/api/collectInvoiceService";
import { toast } from "sonner";

export const useCollectInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0, // API sử dụng 0-indexed page
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    searchTerm: "",
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isCustomerCodeSearch = /^[A-Z0-9]+$/.test(filters.searchTerm);
      const search_owner_name = isCustomerCodeSearch ? null : filters.searchTerm;
      const search_customer_code = isCustomerCodeSearch ? filters.searchTerm : null;

      const response = await collectInvoiceService.getInvoicesToCollect({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        searchOwnerName: search_owner_name,
        searchCustomerCode: search_customer_code,
      });
      setInvoices(response.invoices);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
      }));
    } catch (err) {
      setError(err);
      setInvoices([]);
      setPagination({ currentPage: 0, totalPages: 1, totalItems: 0, pageSize: 10 });
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters.searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchInvoices]);

  const setPage = (pageNumber) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const collectInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      const collectedInvoice = await collectInvoiceService.collectInvoicePayment(invoiceId);
      fetchInvoices();
      return collectedInvoice;
    } catch (err) {
      console.error("Failed to collect invoice:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    pagination: {
      ...pagination,
      currentPage: pagination.currentPage + 1,
    },
    filters,
    setPage: (page) => setPage(page - 1),
    setFilter,
    collectInvoice,
  };
};