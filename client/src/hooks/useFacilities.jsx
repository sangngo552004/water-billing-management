import { useState, useEffect, useCallback } from 'react';
import { facilityService } from '../api/facilityService';
import { setAuthToken } from '../utils/api'; 

export const useFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFacilities, setTotalFacilities] = useState(0); // Thêm state để lưu tổng số cơ sở
  const token = localStorage.getItem('admin_token');
  
  // Thêm các state cho search, filter và pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(null); // null: tất cả, true: hoạt động, false: không hoạt động
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Có thể đặt mặc định hoặc cho phép tùy chỉnh

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Truyền các tham số vào service call
      const data = await facilityService.getAllFacilities({
        searchTerm: searchTerm,
        isActive: isActiveFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setFacilities(data.content); // Giả định API trả về data.facilities
      setTotalFacilities(data.totalElements); // Giả định API trả về data.totalCount
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách cơ sở.');
      setFacilities([]); // Xóa dữ liệu cũ nếu có lỗi
      setTotalFacilities(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, isActiveFilter, currentPage, itemsPerPage]); 

  useEffect(() => {
    setAuthToken(token); 
    fetchFacilities();
  }, [fetchFacilities]); // Re-run fetchFacilities khi fetchFacilities thay đổi

  const addFacility = async (fullAddress) => {
    setLoading(true);
    setError(null);
    try {
      const newFacility = await facilityService.addFacility(fullAddress);
      // Sau khi thêm, tải lại toàn bộ danh sách để đảm bảo dữ liệu mới nhất
      await fetchFacilities();
      return newFacility;
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm cơ sở.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFacility = async (id, fullAddress) => {
    setLoading(true);
    setError(null);
    try {
      const updatedFacility = await facilityService.updateFacility(id, fullAddress);
      // Sau khi cập nhật, tải lại toàn bộ danh sách
      await fetchFacilities();
      return updatedFacility;
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật cơ sở.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFacility = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await facilityService.deleteFacility(id);
      await fetchFacilities();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa cơ sở.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFacilityDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const details = await facilityService.getFacilityDetails(id);
      return details;
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lấy chi tiết cơ sở.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    facilities,
    loading,
    error,
    totalFacilities, // Trả về tổng số cơ sở
    currentPage,
    itemsPerPage,
    searchTerm,
    isActiveFilter,
    setSearchTerm,     // Hàm để thay đổi searchTerm
    setIsActiveFilter, // Hàm để thay đổi isActiveFilter
    setCurrentPage,    // Hàm để thay đổi currentPage
    setItemsPerPage,   // Hàm để thay đổi itemsPerPage
    fetchFacilities,   
    addFacility,
    updateFacility,
        deleteFacility,
    getFacilityDetails,
  };
};