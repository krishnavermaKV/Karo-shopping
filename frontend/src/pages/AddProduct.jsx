
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";

import api from "../services/api";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim() || !Number.isFinite(price) ||
        price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setError("Enter valid product details.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/products", {
        name: form.name.trim(),
        price,
        quantity,
        category_id: null
      });

      alert("Product added successfully!");
      navigate("/");

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">

      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="bg-white border rounded-2xl shadow-sm p-6 sm:p-8">

        <div className="flex items-center gap-3 mb-7">
          <div className="bg-blue-50 p-3 rounded-xl">
            <PackagePlus className="text-blue-600" size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Add New Product
            </h1>
            <p className="text-sm text-slate-500">
              Enter product details and initial stock.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Parle-G Biscuit"
              required
              maxLength={150}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Price per piece (₹)
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="10.00"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Initial Quantity
              </label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0"
                step="1"
                required
                placeholder="100"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 border rounded-lg py-3 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
