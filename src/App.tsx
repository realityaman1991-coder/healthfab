import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ForecastPage from './pages/ForecastPage';
import UnitEconomicsPage from './pages/UnitEconomicsPage';
import ReturnsPage from './pages/ReturnsPage';
import VendorsPage from './pages/VendorsPage';
import LogisticsPage from './pages/LogisticsPage';
import ManufacturingPage from './pages/ManufacturingPage';
import ReportsPage from './pages/ReportsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SOPsPage from './pages/SOPsPage';
import ScaleReadinessPage from './pages/ScaleReadinessPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-56 flex flex-col min-h-screen">
          <Routes>
            <Route path="/"                 element={<DashboardPage />} />
            <Route path="/inventory"        element={<InventoryPage />} />
            <Route path="/orders"           element={<OrdersPage />} />
            <Route path="/forecast"         element={<ForecastPage />} />
            <Route path="/unit-economics"   element={<UnitEconomicsPage />} />
            <Route path="/returns"          element={<ReturnsPage />} />
            <Route path="/vendors"          element={<VendorsPage />} />
            <Route path="/logistics"        element={<LogisticsPage />} />
            <Route path="/manufacturing"    element={<ManufacturingPage />} />
            <Route path="/reports"          element={<ReportsPage />} />
            <Route path="/integrations"     element={<IntegrationsPage />} />
            <Route path="/sops"             element={<SOPsPage />} />
            <Route path="/scale-readiness"  element={<ScaleReadinessPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
