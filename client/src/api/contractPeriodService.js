// src/api/contractService.js
import axios from 'axios';
import api from "../utils/api";

// Định nghĩa URL cơ sở của API của bạn
const API_BASE_URL = 'http://localhost:8080/api'; // Thay thế bằng URL API thực tế của bạn
const token = localStorage.getItem('admin_token');
const YOUR_AUTH_TOKEN = token;

export const getContracts = async ({ page, limit, searchOwnerName, searchAddress, searchCustomerCode }) => {
  try {
    const params = {
      page: page, // API của bạn sử dụng 0-indexed pages
      limit: limit,
    };
    if (searchOwnerName) params.search_owner_name = searchOwnerName;
    if (searchAddress) params.search_address = searchAddress;
    if (searchCustomerCode) params.search_customer_code = searchCustomerCode;

    // Sửa lỗi cú pháp tại đây: gộp params và headers vào cùng một đối tượng cấu hình
    const response = await axios.get(`${API_BASE_URL}/employee/period-contracts/latest-reading`, {
      params: params, // Đặt đối tượng params vào đây
      headers: {     // Đặt đối tượng headers vào đây
        'Content-Type': 'application/json', // Thường không cần thiết cho GET request trừ khi có yêu cầu đặc biệt
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`, // Đảm bảo bạn có biến YOUR_AUTH_TOKEN
      },
    });

    const data = response.data;
    console.log(data)
    const transformedContent = data.period_contracts.map(contract => ({
      id: contract.contractPeriodId,
      customerCode: contract.customerCode,
      customerName: contract.ownerFullName,
      address: contract.facilityAddress,
      recordCount: contract.waterMeterReadings ? contract.waterMeterReadings.length : 0,
      status: contract.status,
      meters: contract.waterMeterReadings ? contract.waterMeterReadings.map(reading => ({
        id: reading.readingId,
        waterMeterId: reading.waterMeterId,
        serialNumber: reading.serialNumber,
        oldReading: reading.previousReading,
        newReading: reading.currentReading,
        volume: reading.usage,
        isConfirmed: reading.isConfirmed,
        createdAt: reading.createdAt,
        image: reading.imageUrl,
        note: reading.note || "",
      })) : [],
      originalContractPeriodId: contract.contractPeriodId
    }));

    return {
      content: transformedContent,
      totalPages: data.total_pages,
      currentPage: data.current_page,
      totalElements: data.total_items,
      itemsPerPage: limit,
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu hợp đồng:", error);
    throw error;
  }
};
export const confirmMeterReading = async (readingId) => {
  try {
    // Giả định API xác nhận là POST đến /water-meter-readings/{readingId}/confirm
    const response = await fetch(`${API_BASE_URL}/admin/billing-process/readings/${readingId}/confirm`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xác nhận bản ghi đồng hồ ${readingId}:`, error);
    throw error;
  }
};

export const createInvoice = async (contractPeriodId) => {
  try {

    const response = await fetch (`${API_BASE_URL}/admin/billing-process/invoices/generate/${contractPeriodId}`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tạo hóa đơn cho hợp đồng kỳ ${contractPeriodId}:`, error);
    throw error;
  }
};


export const getPeriodContracts = (billingPeriodId, params) => {
  return api.get(`admin/billing-periods/${billingPeriodId}/period-contracts`, { params });
};

export const blockPeriodContract = (contractPeriodId) => {
  return api.put(`admin/billing-periods/period-contracts/${contractPeriodId}/block`);
};

export const getBillingPeriodById = (billingPeriodId) => {
  return api.get(`admin/billing-periods/${billingPeriodId}`);
};


