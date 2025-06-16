import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/owner"; 

export const fetchContracts = createAsyncThunk(
  "contracts/fetchAll",
  async (_, thunkAPI) => {
  
    const token = thunkAPI.getState().auth.token;

    if (!token) {
      return thunkAPI.rejectWithValue(
        "Không tìm thấy token. Người dùng có thể chưa đăng nhập."
      );
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || "Lấy danh sách hợp đồng thất bại.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);