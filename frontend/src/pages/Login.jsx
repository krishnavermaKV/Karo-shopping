
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, User } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <div className="flex justify-center mb-5">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <ShoppingBag size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center">
          Karo Shopping
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-7">
          Admin login to manage your shop
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>

            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={19} />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full border rounded-lg py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={19} />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full border rounded-lg py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Authorized shop administrators only
        </p>
      </div>
    </div>
  );
}
