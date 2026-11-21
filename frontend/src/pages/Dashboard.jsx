
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Boxes,
  Package,
  AlertTriangle,
  Receipt,
  RefreshCw
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/products", {
        params: {
          search,
          limit: 100
        }
      });

      setProducts(res.data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.quantity),
    0
  );

  const lowStock = products.filter(
    (p) => p.quantity <= 10
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold">
            Shop Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your shop inventory and products.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/products/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
          >
            <Plus size={19} />
            Add New Item
          </button>

          <button
            onClick={() => navigate("/billing")}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
          >
            <Receipt size={18} />
            Make Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        <StatCard
          title="Total Products"
          value={products.length}
          icon={<Package />}
          color="blue"
        />

        <StatCard
          title="Available Stock"
          value={totalStock}
          icon={<Boxes />}
          color="green"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStock}
          icon={<AlertTriangle />}
          color="orange"
        />

      </div>

      <div className="bg-white rounded-xl border p-5">

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg font-bold">
              Product Inventory
            </h2>
            <p className="text-sm text-slate-500">
              All products available in your shop
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product..."
                className="w-full border rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={fetchProducts}
              className="border p-2.5 rounded-lg hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center py-12 text-slate-500">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto text-slate-300" />
            <p className="mt-3 font-medium">No products found</p>
            <p className="text-sm text-slate-500">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />

                <button
                  onClick={() => navigate("/stock")}
                  className="w-full text-blue-600 text-sm font-medium mt-2 hover:underline"
                >
                  Update stock →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600"
  };

  return (
    <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h2 className="text-2xl font-bold mt-2">{value}</h2>
      </div>

      <div className={`p-3 rounded-xl ${styles[color]}`}>
        {icon}
      </div>
    </div>
  );
}
