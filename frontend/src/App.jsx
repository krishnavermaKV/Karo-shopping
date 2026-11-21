
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import StockManagement from "./pages/StockManagement";
import Billing from "./pages/Billing";

function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />

              <Route
                path="/products/add"
                element={<AddProduct />}
              />

              <Route
                path="/stock"
                element={<StockManagement />}
              />

              <Route
                path="/billing"
                element={<Billing />}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
