import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/admin/AdminLayout'
import Dashboard from '../pages/admin/dashboard/page';
import ContractDetailPage from '../pages/admin/contracts/[id]/page';
import ContractsPage from '../pages/admin/contracts/page';
import CustomersPage from '../pages/admin/customers/page';
import EmployeesPage from '../pages/admin/employees/page';
import FacilitiesPage from '../pages/admin/facilities/page';
import InvoicesPage from '../pages/admin/invoices/page';
import RequestsPage from '../pages/admin/requests/page';
import WaterMetersPage from '../pages/admin/water-meters/page';
import PeriodsPage from '../pages/admin/periods/page';
import PeriodDetailPage from '../pages/admin/periods/[id]/page';
import ConfirmPage from '../pages/admin/confirm/page';


const AdminRoutes = () => (
  <Routes>
    <Route  path = "/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="contracts/:contractId" element={<ContractDetailPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="water-meters" element={<WaterMetersPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="periods" element={<PeriodsPage />} />
        <Route path="periods/:periodId" element={<PeriodDetailPage />} />
        <Route path="confirm" element={<ConfirmPage />} />
    </Route>
  </Routes>
);

export default AdminRoutes;