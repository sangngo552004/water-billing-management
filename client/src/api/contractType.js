// src/api/contractTypes.js
// import { contractTypes as mockContractTypes, pricingTiers as mockPricingTiers } from '../data/mockData'; // Bạn có thể xóa/comment dòng này

const API_BASE_URL = "http://localhost:8080/api/admin"; // <-- Đảm bảo địa chỉ gốc của API của bạn chính xác
const token = localStorage.getItem('admin_token');
const YOUR_AUTH_TOKEN = token;


export const getContractTypes = async () => {
  console.log("Calling API: getContractTypes");
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/type`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`, 
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch contract types. Status: ${response.status}`);
    }

    const data = await response.json(); // Data sẽ là một mảng: [{ typeId, typeName, ... }, ...]
    console.log("Contract types fetched:", data);

    return data.map(type => ({
      id: type.typeId, // Map typeId từ backend sang id của frontend
      name: type.typeName, // Map typeName từ backend sang name của frontend
      description: type.description, // Giữ description nếu cần
      contractCount: type.contractCount || 0 // Giả định có thể có contractCount hoặc mặc định là 0
    }));

  } catch (error) {
    console.error("Error fetching contract types:", error);
    throw error;
  }
};

export const getPricingTiers = async (contractTypeId = null) => {
  console.log("Calling API: getPricingTiers for type", contractTypeId);
  try {
    const url = `${API_BASE_URL}/pricing/type`; 
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch pricing tiers. Status: ${response.status}`);
    }

    const allContractTypesWithTiers = await response.json(); 
    console.log("All contract types with tiers fetched:", allContractTypesWithTiers);

    let tiersToReturn = [];

    if (contractTypeId) {
      const selectedType = allContractTypesWithTiers.find(type => type.typeId === contractTypeId);
      if (selectedType && selectedType.pricingTiers) {
        tiersToReturn = selectedType.pricingTiers.map(tier => ({
          ...tier, 
          contractTypeId: selectedType.typeId 
        }));
      }
    } else {
      
      allContractTypesWithTiers.forEach(type => {
        if (type.pricingTiers) {
          type.pricingTiers.forEach(tier => {
            tiersToReturn.push({
              ...tier,
              contractTypeId: type.typeId 
            });
          });
        }
      });
    }

    return tiersToReturn;

  } catch (error) {
    console.error("Error fetching pricing tiers:", error);
    throw error;
  }
};

export const addContractTypeAndTiers = async (data) => {
  console.log("Calling API: addContractTypeAndTiers with data", data);
  try {
    const response = await fetch(`${API_BASE_URL}/pricing`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
      body: JSON.stringify(data), 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add contract type and tiers. Status: ${response.status}`);
    }

    const result = await response.json(); 
    console.log("Add contract type and tiers successful:", result);
    return result;
  } catch (error) {
    console.error("Error adding contract type and tiers:", error);
    throw error;
  }
};

export const updateContractType = async (typeId, data) => {
  console.log("Calling API: updateContractType for ID", typeId, "with data", data);
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/type/${typeId}/name`, { 
      method: 'PUT', // Hoặc 'PATCH'
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update contract type. Status: ${response.status}`);
    }
    const result = await response.json(); 
    console.log("Update contract type successful:", result);
    return result;
  } catch (error) {
    console.error("Error updating contract type:", error);
    throw error;
  }
};

export const updatePricingTiers = async (contractTypeId, newTiers) => {
  console.log("Calling API: updatePricingTiers for contract type", contractTypeId, "with new tiers", newTiers);
  try {
    console.log(newTiers)
    const response = await fetch(`${API_BASE_URL}/pricing/type/${contractTypeId}/tiers`, { 
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
    newPricingTiers: newTiers,
  }),
});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update pricing tiers. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Update pricing tiers successful:", result);
    return result;
  } catch (error) {
    console.error("Error updating pricing tiers:", error);
    throw error;
  }
};

export const deleteContractType = async (typeId) => {
  console.log("Calling API: deleteContractType for ID", typeId);
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/type/${typeId}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete contract type. Status: ${response.status}`);
    }
    const result = response.status === 204 ? { success: true, message: "No Content" } : await response.json();
    console.log("Delete contract type successful:", result);
    return result;
  } catch (error) {
    console.error("Error deleting contract type:", error);
    throw error;
  }
};