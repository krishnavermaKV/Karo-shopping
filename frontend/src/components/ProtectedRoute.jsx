
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return isLoggedIn
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
