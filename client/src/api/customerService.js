import api from '@/utils/api';

const CUSTOMER_ENDPOINT = '/admin/owners'; 

export const customerService = {

  getAllCustomers: async ({ searchTerm = '', isActive = null, page = 0 } = {}) => {
    try {
      if (page) {
        page -= 1; 
      }

      const params = {
        searchTerm,
        page,
      };

      if (isActive !== null) {
        params.isActive = isActive;
      }

      const response = await api.get(CUSTOMER_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      throw error;
    }
  },

  addCustomer: async (customerData) => {
    try {
      const response = await api.post(CUSTOMER_ENDPOINT, customerData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm khách hàng:', error);
      throw error;
    }
  },

  updateCustomer: async (id, updatedFields) => {
    try {
      const response = await api.put(`${CUSTOMER_ENDPOINT}/${id}`, updatedFields);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật khách hàng với ID ${id}:`, error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`${CUSTOMER_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa khách hàng với ID ${id}:`, error);
      throw error;
    }
  },

  toggleCustomerStatus: async (id, isActive) => {
    try {
      const response = await api.put(`${CUSTOMER_ENDPOINT}/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái khách hàng với ID ${id}:`, error);
      throw error;
    }
  },

  getCustomerDetails: async (id) => {
    try {
      const response = await api.get(`${CUSTOMER_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết khách hàng với ID ${id}:`, error);
      throw error;
    }
  },

  getContractsByCustomerId: async (customerId) => {
    try {
      const response = await api.get(`${CUSTOMER_ENDPOINT}/${customerId}/contracts`);
      return response.data; 
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách hợp đồng cho khách hàng với ID ${customerId}:`, error);
      throw error;
    }
  },
};