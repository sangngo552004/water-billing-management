import { createSlice } from "@reduxjs/toolkit"
import { login } from "./authService";


const currentRole = localStorage.getItem("current_role");
let storedToken = null;

if (currentRole === "admin") {
  storedToken = localStorage.getItem("admin_token");
} else if (currentRole === "employee") {
  storedToken = localStorage.getItem("employee_token");
} else {
  storedToken = localStorage.getItem("token"); // user
}

const initialState = {
  accountId: null,
  role: currentRole || null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      if (state.role === "admin") {
        localStorage.removeItem("admin_token");
      } else if (state.role === "employee") {
        localStorage.removeItem("employee_token");
      } else {
        localStorage.removeItem("token"); 
      }
      localStorage.removeItem("current_role");
      state.accountId = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false; 
      state.loading = false;
      state.error = null;
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accountId = action.payload.accountId; 
        state.role = action.payload.role;       
        state.token = action.payload.token;
        state.isAuthenticated = true; 
        state.error = null;
        if (state.role === "admin") {
          localStorage.setItem("admin_token", state.token);
        } else if (state.role === "employee") {
          localStorage.setItem("employee_token", state.token);
        } else {
          localStorage.setItem("token", state.token); // User
        }
        localStorage.setItem("current_role", state.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
        state.isAuthenticated = false; 
        state.token = null; 
        state.accountId = null;
        state.role = null;
        localStorage.removeItem("token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("employee_token");
        localStorage.removeItem("current_role");
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer