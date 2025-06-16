import { Routes, Route } from 'react-router-dom';
import UserLayout from '../layouts/user/UserLayout'
import DashboardPage from '../pages/user/dashboard/page';
import RequestsPage from '../pages/user/requests/page';
import ProfilePage from '../pages/user/profile/page';
import MetersPage from '../pages/user/meters/page';
import BillsPage from '../pages/user/bills/page';
import BillDetailPage from '../pages/user/bills/[id]/page';


const UserRoutes = () => (
  <Routes>
    <Route element={<UserLayout />}>
        <Route index element={< DashboardPage/>} /> 
        <Route path="requests" element={<RequestsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="meters" element={<MetersPage />} />
        <Route path= "bills" element={<BillsPage />} />
        <Route path="bills/:id" element={<BillDetailPage />} />
    </Route>
  </Routes>
);

export default UserRoutes;