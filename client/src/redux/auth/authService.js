import axios from "axios"
import { createAsyncThunk } from "@reduxjs/toolkit"

const API_BASE_URL = "http://localhost:8080/api/auth";


const loginApi = async (credentials) => {

  try {
    const response = await axios.post(`${API_BASE_URL}/token`, credentials);

    return response.data;
  } catch (error) {
    
    throw error;
  }
  
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const response = await loginApi(credentials); // Gọi hàm loginApi
      // Đảm bảo rằng 'data' từ API của bạn chứa các trường cần thiết
      const data = response.result;
      console.log(data)
      if (!data || !data.token || !data.accountId || !data.roleName) {
        return thunkAPI.rejectWithValue("Invalid response from server. Missing token, accountId, or role.");
      }
      return { token: data.token, accountId: data.accountId, role: data.roleName };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "Login failed. An unexpected error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  }
)

