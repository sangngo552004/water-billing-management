import api from '@/utils/api';

const WATERMETER_ENDPOINT = '/admin/water-meters'; 

export const waterMeterService = {
  getAllWaterMeters: async ({ searchTerm = '', isActive = null, page = 0 } = {}) => {
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
  
        const response = await api.get(WATERMETER_ENDPOINT, { params });
        console.log(response)
        return response.data; 
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đồng hồ nước:', error);
        throw error;
      }
    },

  addWaterMeter: async (serialNumber) => {
      try {
        const response = await api.post(WATERMETER_ENDPOINT, serialNumber );
  
        return response.data;
      } catch (error) {
        console.error('Lỗi khi thêm đồng hồ nước:', error);
        throw error;
      }
    },

  updateWaterMeter: async (meterId, updatedData) => {
    try {
      const updatedMeter = await api.put(`${WATERMETER_ENDPOINT}/${meterId}`, { serialNumber: updatedData });
      return updatedMeter;
    } catch (error) {
      console.error(`Lỗi khi cập nhật đồng hồ nước với ID ${meterId}:`, error);
      throw error;
    }
  },

  deleteWaterMeter: async (meterId) => {
    try {
      const result = await api.delete(`${WATERMETER_ENDPOINT}/${meterId}`);
      return result;
    } catch (error) {
      console.error(`Lỗi khi xóa đồng hồ nước với ID ${meterId}:`, error);
      throw error;
    }
  },

  getWaterMeterDetails: async (meterId) => {
    try {
      const response = await  api.get(`${WATERMETER_ENDPOINT}/${meterId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết đồng hồ nước với ID ${meterId}:`, error);
      throw error;
    }
  },

  getContractsAssociatedWithMeter: async (meterId) => {
    try {
      const response = await api.get(`${WATERMETER_ENDPOINT}/${meterId}/contracts`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy hợp đồng cho đồng hồ nước ID ${meterId}:`, error);
      throw error;
    }
  },
};