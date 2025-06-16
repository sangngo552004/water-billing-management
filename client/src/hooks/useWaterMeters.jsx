import { useState, useEffect, useCallback } from "react";
import { waterMeterService } from "@/api/waterMeterService";
import { setAuthToken } from '../utils/api'; 
const ITEMS_PER_PAGE = 10;

export const useWaterMeters = () => {
        
  // State for Water Meter List
  const [waterMeters, setWaterMeters] = useState([]);
  const [totalWaterMeters, setTotalWaterMeters] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [errorList, setErrorList] = useState(null); // For initial list load errors
  const token = localStorage.getItem('admin_token');

  // State for Water Meter Details View
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [meterDetails, setMeterDetails] = useState(null);
  const [meterContracts, setMeterContracts] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null); // For detail load errors

  // --- Water Meter List Management ---
  const fetchWaterMeters = useCallback(async () => {
    setIsLoadingList(true);
    setErrorList(null); // Clear previous errors for list fetch
    try {
      const response = await waterMeterService.getAllWaterMeters({
        searchTerm : searchTerm,
        isActive : isActiveFilter ,
        page: currentPage,
      });
      setWaterMeters(response.content);
      setTotalWaterMeters(response.totalElements);
    } catch (err) {
      setErrorList(err.message || "Không thể tải danh sách đồng hồ nước.");
      console.error("Fetch water meters error:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, [searchTerm, isActiveFilter, currentPage]);

  useEffect(() => {
        setAuthToken(token);
    fetchWaterMeters();
  }, [fetchWaterMeters])

  const totalPages = Math.ceil(totalWaterMeters / ITEMS_PER_PAGE);

  // CRUD operations that will be called from page.jsx.
  // These will *throw* errors for the page.jsx to catch and display via toast.
  const addMeter = async (newMeterData) => {
    setIsLoadingList(true); // Indicate loading for list affected
    try {
      const newMeter = await waterMeterService.addWaterMeter(newMeterData);
      await fetchWaterMeters(); // Re-fetch list to show new meter
      return newMeter;
    } finally {
      setIsLoadingList(false); // Reset regardless of success/fail
    }
  };

  const editMeter = async (meterId, updatedData) => {
    setIsLoadingList(true);
    try {
      const updatedMeter = await waterMeterService.updateWaterMeter(meterId, updatedData);
      await fetchWaterMeters();
      return updatedMeter;
    } finally {
      setIsLoadingList(false);
    }
  };

  const deleteMeter = async (meterId) => {
    setIsLoadingList(true);
    try {
      await waterMeterService.deleteWaterMeter(meterId);
      await fetchWaterMeters();
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- Water Meter Details Management ---
  const fetchMeterDetails = useCallback(async () => {
    if (!selectedMeterId) {
      setMeterDetails(null);
      setMeterContracts([]);
      return;
    }

    setIsLoadingDetails(true);
    setErrorDetails(null); // Clear previous errors for detail fetch
    try {
      const meter = await waterMeterService.getWaterMeterDetails(selectedMeterId);
      setMeterDetails(meter);

      const contracts = await waterMeterService.getContractsAssociatedWithMeter(selectedMeterId);
      setMeterContracts(contracts);
    } catch (err) {
      setErrorDetails(err.message || "Không thể tải chi tiết đồng hồ hoặc hợp đồng liên quan.");
      console.error("Fetch meter details error:", err);
      setMeterDetails(null);
      setMeterContracts([]); // Clear data on error
    } finally {
      setIsLoadingDetails(false);
    }
  }, [selectedMeterId]);

  useEffect(() => {
    fetchMeterDetails();
  }, [fetchMeterDetails]);

  const viewMeter = (meterId) => {
    setSelectedMeterId(meterId);
  };

  const clearMeterView = () => {
    setSelectedMeterId(null);
    setMeterDetails(null);
    setMeterContracts([]);
  };

  return {
    // List state and functions
    waterMeters,
    totalWaterMeters,
    totalPages,
    currentPage,
    searchTerm,
    isActiveFilter,
    isLoadingList,
    errorList,
    setSearchTerm,
    setIsActiveFilter,
    setCurrentPage,
    addMeter,
    editMeter,
    deleteMeter,
    fetchWaterMeters, // Can be used to manually trigger a re-fetch

    // Detail state and functions
    selectedMeterId,
    meterDetails,
    meterContracts,
    isLoadingDetails,
    errorDetails,
    viewMeter,
    clearMeterView,
  };
};