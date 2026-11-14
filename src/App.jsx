import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="users" element={<PlaceholderPage title="Users" />} />
          <Route
            path="providers"
            element={<PlaceholderPage title="Providers" />}
          />
          <Route
            path="verifications"
            element={<PlaceholderPage title="Verifications" />}
          />
          <Route
            path="marketplace-listings"
            element={<PlaceholderPage title="Marketplace Listings" />}
          />
          <Route
            path="rental-listings"
            element={<PlaceholderPage title="Rental Listings" />}
          />
          <Route
            path="categories"
            element={<PlaceholderPage title="Categories" />}
          />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
          <Route
            path="system-monitor"
            element={<PlaceholderPage title="System Monitor" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
