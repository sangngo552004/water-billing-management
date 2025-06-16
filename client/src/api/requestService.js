// src/services/requestService.js
import api from '@/utils/api'; // Sử dụng instance Axios chung của bạn

const REQUEST_ENDPOINT = '/admin/requests'; // Endpoint API cho yêu cầu

const requestService = {

  getRequests: async (params) => {
    
    try {
        
      const apiParams = {
        ...params,
        page: params.page - 1,
      };

      const response = await api.get(REQUEST_ENDPOINT, { params: apiParams });
      return response.data; 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách yêu cầu.';
      console.error('Lỗi khi lấy danh sách yêu cầu:', error);
      throw error;
    }
  },


  getRequestById: async (id) => {
    try {
      const response = await api.get(`${REQUEST_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải chi tiết yêu cầu.';
      console.error('Lỗi khi tải chi tiết yêu cầu:', error);
      throw error;
    }
  },

  approveRequest: async (id) => {
    try {
      const response = await api.put(`${REQUEST_ENDPOINT}/${id}/approve`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi phê duyệt yêu cầu.';
      console.error('Lỗi khi phê duyệt yêu cầu:', error);
      throw error;
    }
  },

  rejectRequest: async (id) => {
    try {
      const response = await api.put(`${REQUEST_ENDPOINT}/${id}/reject`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi từ chối yêu cầu.';
      console.error('Lỗi khi từ chối yêu cầu:', error);
      throw error;
    }
  },

  getRequestTypes: () => {
    return ['Tất cả', 'Thay đổi thông tin', 'Dừng dịch vụ', 'Báo hỏng đồng hồ'];
  },
};

export default requestService;