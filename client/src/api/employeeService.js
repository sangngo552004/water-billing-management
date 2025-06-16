import api from '@/utils/api'; // Import mock API, trong thực tế sẽ là API thật


const EMPLOYEE_ENDPOINT = '/admin/employees'; 
// Mapping roleId to display text
const ROLE_ID_TO_TEXT = {
  1000000: 'Quản lý',
  1000001: 'Nhân viên',
};

// Mapping display text to roleId for sending to API
const ROLE_TEXT_TO_ID = {
  'Quản lý': 1000000,
  'Nhân viên': 1000001,
};

const employeeService = {
  getEmployees: async ({ searchTerm = '', isActive = null, page = 0 } = {}) => {
      try {
          if (page) {
                  page -= 1;
          }
        const params = {
          searchTerm,
          page ,
        };
  
        if (isActive !== null) {
          params.isActive = isActive;
        }
  
        const response = await api.get(EMPLOYEE_ENDPOINT, { params });
        console.log(response)
        return response.data; 
      } catch (error) {
        console.error('Lỗi khi lấy danh sách cơ sở:', error);
        throw error;
      }
    },

  addEmployee: async (employeeData) => {
    try {
      console.log(employeeData)
      const dataToSend = {
        username: employeeData.username,
        password: employeeData.password,
        fullName: employeeData.fullName,
        email: employeeData.email,
        phoneNumber: employeeData.phoneNumber,
        roleId: ROLE_TEXT_TO_ID[employeeData.role], 
      };
      const response = await api.post(EMPLOYEE_ENDPOINT, dataToSend);
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Lỗi khi thêm nhân viên.';
      toast.error(errorMessage);
      throw error;
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      const dataToSend = {
        ...employeeData,
        roleId: ROLE_TEXT_TO_ID[employeeData.role], 
      };
      const response = await api.put( `${EMPLOYEE_ENDPOINT}/${id}`, dataToSend);
      return response.employee;
    } catch (error) {
     console.log(error.message || 'Lỗi khi cập nhật nhân viên.');
      throw error;
    }
  },

  toggleEmployeeStatus: async (id, isActive) => {
    try {
      const response = await api.put(`${EMPLOYEE_ENDPOINT}/${id}/status`);
      return response.data;
    } catch (error) {
      const action = isActive ? "Kích hoạt" : "Khóa";
      console.log(error.message || `Lỗi khi ${action} nhân viên.`);
      throw error;
    }
  },


  // Helper function to get display text from roleId
  getRoleDisplayText: (roleId) => {
    return ROLE_ID_TO_TEXT[roleId] || 'Không xác định';
  },

  // Helper function to get role options for forms
  getRoleOptions: () => [
    { value: 'Quản lý', id: 1000000 },
    { value: 'Nhân viên', id: 1000001 },
  ]
};

export default employeeService;