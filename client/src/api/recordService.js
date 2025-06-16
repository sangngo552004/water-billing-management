// Base URL cho API của bạn.
const API_BASE_URL = "http://localhost:8080/api/employee";

const getAuthToken = () => {
  const token = localStorage.getItem("employee_token");
  return token;
};

const fetchData = async (url, options = {}) => {
  const token = getAuthToken(); // Lấy token xác thực

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: headers, // Gắn headers đã có token
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi API: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Lỗi khi gọi API:", url, error);
    throw error;
  }
};

export const recordService = {
  // API lấy danh sách hợp đồng chờ xác nhận (pending)
  getLatestPendingPeriodContracts: async ({
    page = 0,
    search_owner_name = "",
    search_address = "",
    search_customer_code = "",
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
    });
    if (search_owner_name) params.append("search_owner_name", search_owner_name);
    if (search_address) params.append("search_address", search_address);
    if (search_customer_code) params.append("search_customer_code", search_customer_code);

    const url = `${API_BASE_URL}/period-contracts/latest-pending?${params.toString()}`;
    const data = await fetchData(url);

    return {
      totalPages: data.total_pages,
      currentPage: data.current_page,
      totalItems: data.total_items,
      periodContracts: data.period_contracts.map((contract) => ({
        id: contract.contractId,
        contractPeriodId: contract.contractPeriodId,
        periodId: contract.periodId,
        periodName: contract.periodName,
        customerCode: contract.customerCode,
        customerName: contract.ownerFullName,
        address: contract.facilityAddress,
        status: contract.status,
        note: contract.note,
        meters: contract.waterMeterAssignments.map((assignment) => ({
          id: assignment.waterMeterId,
          oldReading: assignment.currentReading,
          serialNumber: assignment.serialNumber,
          assignmentId: assignment.assignmentId,
        })),
        allConfirmed: false
      })),
    };
  },

  // API lấy danh sách hợp đồng ở trạng thái 'reading' (chưa ghi / unrecorded)
  getLatestReadingPeriodContracts: async ({
    page = 0,
    search_owner_name = "",
    search_address = "",
    search_customer_code = "",
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
    });
    if (search_owner_name) params.append("search_owner_name", search_owner_name);
    if (search_address) params.append("search_address", search_address);
    if (search_customer_code) params.append("search_customer_code", search_customer_code);

    const url = `${API_BASE_URL}/period-contracts/latest-reading?${params.toString()}`;
    const data = await fetchData(url);

    return {
      totalPages: data.total_pages,
      currentPage: data.current_page,
      totalItems: data.total_items,
      periodContracts: data.period_contracts.map((contract) => ({
        id: contract.contractId,
        contractPeriodId: contract.contractPeriodId,
        periodId: contract.periodId,
        periodName: contract.periodName,
        customerCode: contract.customerCode,
        customerName: contract.ownerFullName,
        address: contract.facilityAddress,
        status: contract.status,
        note: contract.note,
        meters: contract.waterMeterAssignments.map((assignment) => ({
          id: assignment.meterId,
          oldReading: assignment.lastReading,
        })),
        waterMeterReadings: contract.waterMeterReadings.map((reading) => ({
          id: reading.readingId,
          image: reading.imageUrl,
          isConfirm: reading.isConfirmed,
          serialNumber: reading.serialNumber,
          oldReading: reading.previousReading,
          newReading: reading.currentReading,
        })),
        records: [],
        allConfirmed: contract.waterMeterReadings.every((r) => r.isConfirmed),
      })),
    };
  },

  // API để ghi bản ghi (POST) - Gửi JSON
  saveMeterRecord: async (contractPeriodId, assignmentId, newReading, imageUrl) => {
    const payload = {
      contractPeriodId: contractPeriodId,
      assignmentId: assignmentId,
      currentReading: newReading,
      image: imageUrl, 
    };
    console.log(payload)
    const url = `${API_BASE_URL}/water-meter-readings`;
    const data = await fetchData(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Bắt buộc phải có Content-Type này cho JSON
      },
      body: JSON.stringify(payload), // Chuyển object thành chuỗi JSON
    });
    return data;
  },

  // API để sửa bản ghi (PUT/PATCH) - Gửi JSON
  editMeterRecord: async (readingId, updatedData) => {
    const payload = {};
    if (updatedData.newReading !== undefined) {
      payload.currentReading = updatedData.newReading;
    }
    if (updatedData.note !== undefined) {
      payload.note = updatedData.note || "";
    }
    // If updatedData.image is a URL string or null, include it in JSON
    // If you intend to remove the image, you might send null or an empty string,
    // depending on what your backend expects for image removal.
    if (updatedData.image !== undefined) {
      payload.image = updatedData.image; // Assuming it's a URL string or null
    }

    const url = `${API_BASE_URL}/water-meter-readings/${readingId}`;
    const data = await fetchData(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Bắt buộc phải có Content-Type này cho JSON
      },
      body: JSON.stringify(payload), // Chuyển object thành chuỗi JSON
    });
    return data;
  },
};