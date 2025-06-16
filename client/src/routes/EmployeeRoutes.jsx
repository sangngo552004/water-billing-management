import { Routes, Route } from 'react-router-dom';
import CollectPage from '../pages/employee/collect/page';
import RecordPage from '../pages/employee/record/page';
import EmployeeLayout from '../layouts/employee/EmployeeLayout';


const EmployeeRoutes = () => (
  <Routes >
        <Route  path = "/" element={<EmployeeLayout />}>
                <Route path="/collect" element={<CollectPage />} />
                <Route path="/record" element={<RecordPage />} />
        </Route>
  </Routes>
);

export default EmployeeRoutes;