import api from '@/utils/api';

const FACILITY_ENDPOINT = '/admin/facilities'; 

export const facilityService = {
  getAllFacilities: async ({ searchTerm = '', isActive = null, page = 0 } = {}) => {
    try {
        if (page) {
                page -= 1;
        }
      const params = {
        searchTerm,
        page ,
      };

      if (isActive !== null) {
        params.isActive = isActive;
      }

      const response = await api.get(FACILITY_ENDPOINT, { params });
      console.log(response)
      return response.data; 
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cơ sở:', error);
      throw error;
    }
  },

  // Thêm cơ sở mới
  addFacility: async (fullAddress) => {
    try {
      const response = await api.post(FACILITY_ENDPOINT, { fullAddress: fullAddress });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm cơ sở:', error);
      throw error;
    }
  },

  // Cập nhật cơ sở
  updateFacility: async (id, fullAddress) => {
    try {
      const response = await api.put(`${FACILITY_ENDPOINT}/${id}`, { address: fullAddress });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật cơ sở với ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa cơ sở
  deleteFacility: async (id) => {
    try {
      const response = await api.delete(`${FACILITY_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa cơ sở với ID ${id}:`, error);
      throw error;
    }
  },

  getFacilityDetails: async (id) => {
    try {
      const response = await api.get(`${FACILITY_ENDPOINT}/${id}/contracts`);
      console.log(response)
      return response.data;
      
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết cơ sở với ID ${id}:`, error);
      throw error;
    }
  },
};