// services/collectInvoiceService.js
import { toast } from "sonner"; // Đảm bảo bạn đã cài đặt và cấu hình sonner

const API_BASE_URL = "http://localhost:8080/api/employee/invoices"; // <<< THAY THẾ BẰNG URL API CỦA BẠN >>>

// Hàm giả định để lấy token. Bạn cần thay thế bằng logic thực tế của ứng dụng bạn.
const getAuthToken = () => {
  return localStorage.getItem('employee_token');
};

// Hàm trợ giúp để tạo headers với Authorization token
const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const collectInvoiceService = {
  getInvoicesToCollect: async ({ page, limit, searchOwnerName, searchCustomerCode }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (searchOwnerName) params.append("search_owner_name", searchOwnerName);
      if (searchCustomerCode) params.append("search_customer_code", searchCustomerCode);

      const response = await fetch(`${API_BASE_URL}/latest-to-collect?${params.toString()}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
        }
        throw new Error("Failed to fetch invoices to collect");
      }
      const data = await response.json();
      return {
        invoices: data.invoices,
        pagination: {
          currentPage: data.current_page,
          totalPages: data.total_pages,
          totalItems: data.total_items,
          pageSize: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching invoices to collect:", error);
      if (!error.message.includes("Phiên đăng nhập hết hạn")) {
         toast.error("Lỗi khi tải danh sách hóa đơn cần thu.");
      }
      throw error;
    }
  },

  collectInvoicePayment: async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/collect`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to collect payment");
      }
      const data = await response.json();
      toast.success(`Đã thu tiền hóa đơn #${invoiceId} thành công.`);
      return data;
    } catch (error) {
      console.error("Error collecting payment:", error);
      if (!error.message.includes("Phiên đăng nhập hết hạn")) {
         toast.error(`Lỗi khi thu tiền hóa đơn: ${error.message}`);
      }
      throw error;
    }
  },
};