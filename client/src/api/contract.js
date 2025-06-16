// src/api/contracts.js
import { contracts as mockContracts } from '../data/mockData'; // Giả sử bạn có file mockData.js

const API_BASE_URL = "http://localhost:8080/api/admin"; 
const token = localStorage.getItem('admin_token');
const YOUR_AUTH_TOKEN = token;

export const getContracts = async (params) => {
  console.log("Calling API: getContracts with params", params);

  try {
    const queryParams = new URLSearchParams();
    if (params.searchTerm) {
      queryParams.append("searchTerm", params.searchTerm);
    }
    if (params.statusFilter && params.statusFilter !== "all") {
      queryParams.append("status", params.statusFilter); 
    }

    if (params.currentPage >= 0) {
        queryParams.append("page", params.currentPage);
    }
    
    const url = `${API_BASE_URL}/contracts?${queryParams.toString()}`;
    console.log("Fetching from URL:", url);

    const response = await fetch(url, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }

    const apiResponse = await response.json(); 

    return {
      data: apiResponse.content.map(contract => ({
        id: contract.contractId, 
        customerCode: contract.customerCode,
        ownerName: contract.ownerFullName, 
        address: contract.facilityAddress, 
        contractType: contract.contractTypeName, 
        status: contract.status,
        startDate: contract.startDate,
      })),
      totalCount: apiResponse.totalElements,
    };

  } catch (error) {
    console.error("Error fetching contracts from API:", error);
    throw error;
  }
};

 
export const addContract = async (contractData) => {
  console.log("Calling API: addContract with data", contractData);
  try {
    
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${YOUR_AUTH_TOKEN}` 
       ,'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      ownerId: contractData.customerId,
      facilityId: contractData.facilityId,
      contractTypeId: contractData.contractTypeId,
      startDate: contractData.startDate,
      image : contractData.imageUrl.url
    }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add contract. Status: ${response.status}`);
    }

    const newContract = await response.json();
    console.log("Add contract successful:", newContract);
    return newContract;

  } catch (error) {
    console.error("Error adding contract:", error);
    throw error;
  }
};

export const suspendContract = async (contractId) => {
  console.log("Calling API: suspendContract for ID", contractId);
  try {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/suspend`, { 
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to suspend contract. Status: ${response.status}`);
    }

    const result = await response.json(); 
    console.log("Suspend contract successful:", result);
    return result; 
  } catch (error) {
    console.error("Error suspending contract:", error);
    throw error;
  }
};

export const cancelContract = async (contractId) => {
  console.log("Calling API: cancelContract for ID", contractId);
  try {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/cancel`, {
      method: 'PUT', // Hoặc 'PATCH'
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to cancel contract. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Cancel contract successful:", result);
    return result;
  } catch (error) {
    console.error("Error canceling contract:", error);
    throw error;
  }
};

export const activateContract = async (contractId) => {
  console.log("Calling API: activateContract for ID", contractId);
  try {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/active`, { 
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to activate contract. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Activate contract successful:", result);
    return result;
  } catch (error) {
    console.error("Error activating contract:", error);
    throw error;
  }
};

export const getCustomers = async (searchQuery) => {
  console.log("Calling API: getCustomers with search", searchQuery);
  try {
    const query = searchQuery ? `?searchTerm=${encodeURIComponent(searchQuery)}` : "";
    const response = await fetch(`${API_BASE_URL}/owners${query}`, { // Endpoint API giả định
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch customers. Status: ${response.status}`);
    }

    const customers = await response.json();
    console.log("Customers fetched:", customers);
    return customers.content;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getFacilities = async (searchQuery) => {
  console.log("Calling API: getFacilities with search", searchQuery);
  try {
    const query = searchQuery ? `&&searchTerm=${encodeURIComponent(searchQuery)}` : "";
    const response = await fetch(`${API_BASE_URL}/facilities?isActive=false${query}`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch facilities. Status: ${response.status}`);
    }

    const facilities = await response.json();
    console.log("Facilities fetched:", facilities);
    // Giả sử API trả về một mảng trực tiếp
    // Nếu API trả về { content: [...] } thì bạn cần return facilities.content;
    return facilities.content;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};