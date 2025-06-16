const API_BASE_URL = "http://localhost:8080/api/admin";

// Hàm lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return token;
};

// Hàm xử lý phản hồi HTTP
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized or Forbidden access. Please log in again.");
    }
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Lấy danh sách các kỳ
export const getPeriods = async (params) => {
  const token = getToken();
  const queryParams = new URLSearchParams();

  // Thêm các tham số vào query string
  if (params.page !== undefined) queryParams.append("page", params.page);
  if (params.size !== undefined) queryParams.append("size", params.size);
  if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params.year && params.year !== "Tất cả") queryParams.append("year", params.year);

  const url = `${API_BASE_URL}/billing-periods?${queryParams.toString()}`;
  console.log("Fetching periods from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

// Thêm kỳ mới
export const createPeriod = async (periodData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/billing-periods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(periodData)
  });
  return handleResponse(response);
};

// Cập nhật kỳ
export const updatePeriod = async (id, periodData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/billing-periods/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(periodData)
  });
  return handleResponse(response);
};

// Xóa kỳ
export const deletePeriod = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/billing-periods/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized or Forbidden access. Please log in again.");
    }
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return { message: "Period deleted successfully" }; // DELETE thường không trả về JSON body
};

// Hoàn thành kỳ
export const completePeriod = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/billing-periods/${id}/completed`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(response);
};