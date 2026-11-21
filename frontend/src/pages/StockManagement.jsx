
import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Minus,
  Package,
  RefreshCw
} from "lucide-react";

import api from "../services/api";

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products", {
        params: {
          search,
          limit: 100
        }
      });

      setProducts(res.data.products || []);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const changeQuantity = (id, amount) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(
        0,
        (Number(prev[id]) || 0) + amount
      )
    }));
  };

  const updateStock = async (product) => {
    const quantity = Number(quantities[product.id]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Enter a valid incoming quantity.");
      return;
    }

    try {
      setUpdatingId(product.id);

      const res = await api.patch(
        `/products/${product.id}/stock`,
        {
          quantity,
          notes: "New stock received"
        }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, ...res.data.product }
            : p
        )
      );

      setQuantities((prev) => ({
        ...prev,
        [product.id]: 0
      }));

      alert(
        `${product.name}: Stock increased by ${quantity} pieces.`
      );

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update stock"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">

      <div className="mb-7">
        <h1 className="text-2xl font-bold">
          Manage Inventory
        </h1>

        <p className="text-slate-500 mt-1">
          Update stock whenever new products arrive.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5">

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">

          <div>
            <h2 className="font-bold text-lg">
              Existing Products
            </h2>
            <p className="text-sm text-slate-500">
              Add incoming pieces to available stock.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="border rounded-lg py-2.5 pl-10 pr-3 w-full sm:w-72 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {loading ? (
          <p className="text-center py-10">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-10 text-slate-500">
            No products found.
          </p>
        ) : (
          <div className="space-y-3">

            {products.map((product) => {
              const incoming = Number(quantities[product.id]) || 0;

              return (
                <div
                  key={product.id}
                  className="border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Package className="text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {product.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        ₹{Number(product.price).toFixed(2)} / piece
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">

                    <div>
                      <p className="text-xs text-slate-500">
                        Current stock
                      </p>
                      <p className="font-bold text-lg">
                        {product.quantity} pcs
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(product.id, -1)}
                        className="border p-2 rounded-lg hover:bg-slate-100"
                      >
                        <Minus size={17} />
                      </button>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[product.id] ?? 0}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: e.target.value
                          }))
                        }
                        className="border rounded-lg p-2 w-20 text-center"
                      />

                      <button
                        onClick={() => changeQuantity(product.id, 1)}
                        className="border p-2 rounded-lg hover:bg-slate-100"
                      >
                        <Plus size={17} />
                      </button>
                    </div>

                    <button
                      onClick={() => updateStock(product)}
                      disabled={updatingId === product.id}
                      className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === product.id
                        ? "Updating..."
                        : "Add Stock"}
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}
