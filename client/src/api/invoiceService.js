import { toast } from "sonner"; // Assuming sonner is installed and configured

const API_BASE_URL = "http://localhost:8080/api/admin"; // Thay thế bằng URL API của bạn

// Hàm giả định để lấy token. Bạn cần thay thế bằng logic thực tế của mình
const getAuthToken = () => {
  // Ví dụ: Lấy token từ localStorage
  return localStorage.getItem('admin_token');
};

// Hàm trợ giúp để tạo headers với Authorization token
const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), 
  };
};

export const invoiceService = {
  getBillingPeriods: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing-periods/summary`, {
        headers: getHeaders(), 
      });
      if (!response.ok) {
        // Xử lý lỗi 401/403 (Unauthorized/Forbidden)
        if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
          // Có thể redirect về trang đăng nhập tại đây
          // window.location.href = '/login';
        }
        throw new Error("Failed to fetch billing periods");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching billing periods:", error);
      // Toast error đã được xử lý bởi các trường hợp cụ thể bên trên hoặc bởi hàm chung
      if (!error.message.includes("Phiên đăng nhập hết hạn")) { // Tránh toast kép nếu đã xử lý 401/403
         toast.error("Lỗi khi tải danh sách kỳ hóa đơn.");
      }
      throw error;
    }
  },

  getInvoicesForAdmin: async ({ billingPeriodId, searchTerm, status, page, size, sortBy, sortDir }) => {
    try {
      const params = new URLSearchParams();
      if (billingPeriodId) params.append("billingPeriodId", billingPeriodId);
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (status && status !== "all") params.append("status", status);
      params.append("page", page - 1);
      params.append("size", size);
      params.append("sortBy", sortBy);
      params.append("sortDir", sortDir);

      const response = await fetch(`${API_BASE_URL}/invoices?${params.toString()}`, {
        headers: getHeaders(), // Thêm headers vào request
      });
      if (!response.ok) {
         if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
          // window.location.href = '/login';
        }
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (!error.message.includes("Phiên đăng nhập hết hạn")) {
         toast.error("Lỗi khi tải danh sách hóa đơn.");
      }
      throw error;
    }
  },

  cancelInvoice: async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/cancel`, {
        method: "PUT",
        headers: getHeaders(), // Thêm headers vào request
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
          // window.location.href = '/login';
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel invoice");
      }
      const data = await response.json();
      toast.success(`Hóa đơn #${invoiceId} đã được hủy thành công.`);
      return data;
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      if (!error.message.includes("Phiên đăng nhập hết hạn")) {
         toast.error(`Lỗi khi hủy hóa đơn: ${error.message}`);
      }
      throw error;
    }
  },

  getInvoiceDetail: async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        headers: getHeaders(), // Thêm headers vào request
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
          // window.location.href = '/login';
        }
        throw new Error("Failed to fetch invoice details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching invoice detail:", error);
      if (!error.message.includes("Phiên đăng nhập hết hạn")) {
         toast.error("Lỗi khi tải chi tiết hóa đơn.");
      }
      throw error;
    }
  },
};