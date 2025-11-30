import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Users from './pages/Users';
import Locations from './pages/Locations';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Assignments from './pages/Assignments';
import Maintenance from './pages/Maintenance';
import Moves from './pages/Moves';
import AuditLogs from './pages/AuditLogs';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="users" element={<Users />} />
            <Route path="locations" element={<Locations />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="moves" element={<Moves />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
