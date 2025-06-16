
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserRoutes from './routes/UserRoutes';
import './styles/App.css';
import ProtectedRoute  from './routes/ProtectedRoutes';
import NotFoundPage from './pages/NotFoundPage';
import UserLoginPage from './pages/public/UserLoginPage';
import RegisterPage from "./pages/public/register/Page";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import AdminLoginPage from "./pages/public/AdminLoginPage";
import EmployeeLoginPage from "./pages/public/EmployeeLoginPage";
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import AdminRoutes from './routes/AdminRoutes';
import EmployeeRoutes from './routes/EmployeeRoutes';

const App = () => {
  return (
         <Router>
          <Routes>
          
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/employee/login" element={<EmployeeLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage/>} />

            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/:customerCode/*" element={<UserRoutes />} />
            </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Route>
              
    
              <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
              <Route path="/employee/*" element={<EmployeeRoutes />} />
              </Route>
                

              
              {/* <Route path="/admin/" element  */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
    </Router>
  );
};

export default App;
