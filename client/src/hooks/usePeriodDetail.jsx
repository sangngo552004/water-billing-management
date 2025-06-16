import { useState, useEffect, useCallback } from 'react';
import { getPeriodContracts, blockPeriodContract, getBillingPeriodById } from '@/api/contractPeriodService';
import { setAuthToken } from '@/utils/api';
import { toast } from 'sonner';

export const usePeriodContracts = (billingPeriodId, searchTerm, status, page, size, sortBy, sortDir) => {
  const [periodDetail, setPeriodDetail] = useState(null); // New state for period detail
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(async () => {
    if (!billingPeriodId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      setAuthToken(token);

      // Fetch Period Detail
      const periodResponse = await getBillingPeriodById(billingPeriodId);
      setPeriodDetail(periodResponse.data);

      // Fetch Contracts
      const contractsResponse = await getPeriodContracts(billingPeriodId, {
        searchTerm,
        status: status === 'Tất cả' ? undefined : status,
        page: page - 1, // API is 0-indexed
      });
      setContracts(contractsResponse.data.content.map(contract => ({
        ...contract,
        id: contract.contractPeriodId,
        customerName: contract.ownerFullName,
        address: contract.facilityAddress,
        isPaused: contract.status === 'blocked',
        pauseReason: contract.note,

      })));
      setTotalPages(contractsResponse.data.totalPages);
      setTotalItems(contractsResponse.data.totalElements);

    } catch (err) {
      setError(err);
      // Determine which toast to show based on what failed, or a general one
      toast.error('Failed to load data.', {
        description: err.message || 'An unexpected error occurred while fetching period or contracts.',
      });
    } finally {
      setLoading(false);
    }
  }, [billingPeriodId, searchTerm, status, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const blockContract = async (contractPeriodId) => {
    try {
      setAuthToken(localStorage.getItem('admin_token'));
      await blockPeriodContract(contractPeriodId);
      toast.success('Contract blocked successfully.');
      // After blocking, re-fetch all data to update both contract list and period summary
      fetchData();
    } catch (err) {
      setError(err);
      toast.error('Failed to block contract.', {
        description: err.message || 'An unexpected error occurred.',
      });
      throw err;
    }
  };

  return { periodDetail, contracts, loading, error, totalPages, totalItems, fetchData, blockContract };
};