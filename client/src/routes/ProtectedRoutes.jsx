import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {jwtDecode} from "jwt-decode";
import {selectAccountId, selectRole, selectToken} from "../redux/auth/authSelector";


const ProtectedRoute = ({ allowedRoles }) => {
  const accountId = useSelector(selectAccountId);
  const role = useSelector(selectRole);
  const token = useSelector(selectToken);

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const isAuthenticated = !!accountId && !!role && !!token && isTokenValid(token);

  const getLoginRedirect = () => {
    if (allowedRoles.includes("admin")) return "/admin/login";
    if (allowedRoles.includes("employee")) return "/employee/login";
    return "/login";
  };

  if (!isAuthenticated) {
    return <Navigate to={getLoginRedirect()} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;