
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingCart,
  CheckCircle2
} from "lucide-react";

import api from "../services/api";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState("0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedBill, setGeneratedBill] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products", {
        params: {
          search,
          limit: 100
        }
      });

      setProducts(res.data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const current = prev[product.id] || 0;

      if (current >= product.quantity) {
        return prev;
      }

      return {
        ...prev,
        [product.id]: current + 1
      };
    });

    setGeneratedBill(null);
  };

  const updateQuantity = (product, quantity) => {
    const nextQuantity = Math.max(
      0,
      Math.min(Number(quantity) || 0, product.quantity)
    );

    setCart((prev) => {
      const updated = { ...prev };

      if (nextQuantity === 0) {
        delete updated[product.id];
      } else {
        updated[product.id] = nextQuantity;
      }

      return updated;
    });

    setGeneratedBill(null);
  };

  const selectedItems = useMemo(() => {
    return products
      .filter((p) => Number(cart[p.id]) > 0)
      .map((p) => ({
        ...p,
        selectedQuantity: Number(cart[p.id]),
        lineTotal:
          Number(p.price) * Number(cart[p.id])
      }));
  }, [products, cart]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  const discountValue = Number(discount) || 0;
  const total = subtotal - discountValue;

  const createBill = async () => {
    setError("");

    if (selectedItems.length === 0) {
      setError("Please select at least one product.");
      return;
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue < 0 ||
      discountValue > subtotal
    ) {
      setError("Enter a valid discount.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/bills", {
        customer_name: customerName.trim() || null,
        discount: discountValue,
        items: selectedItems.map((item) => ({
          product_id: item.id,
          quantity: item.selectedQuantity
        }))
      });

      setGeneratedBill(res.data.bill);
      setCart({});
      setCustomerName("");
      setDiscount("0");

      // Refresh available stock
      const updated = await api.get("/products", {
        params: { limit: 100 }
      });

      setProducts(updated.data.products || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to generate bill"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount) =>
    `₹${Number(amount).toFixed(2)}`;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">

      <div className="mb-7">
        <h1 className="text-2xl font-bold">
          Billing & Checkout
        </h1>

        <p className="text-slate-500 mt-1">
          Select products and generate a customer bill.
        </p>
      </div>

      {generatedBill && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-2 text-green-700 font-bold">
            <CheckCircle2 />
            Bill generated successfully!
          </div>

          <p className="mt-2 text-sm">
            Bill Number: {generatedBill.bill_number}
          </p>

          <p className="text-sm">
            Total: {formatMoney(generatedBill.total_amount)}
          </p>

          <button
            onClick={() => window.print()}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm print:hidden"
          >
            Print Bill
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* PRODUCT SECTION */}

        <div className="lg:col-span-2 bg-white border rounded-xl p-5">

          <div className="flex justify-between items-center gap-3 mb-5">
            <h2 className="font-bold text-lg">
              Select Products
            </h2>

            <span className="text-sm text-slate-500">
              {selectedItems.length} selected
            </span>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <p className="text-center py-10">Loading products...</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">

              {products.map((product) => {
                const quantity = cart[product.id] || 0;

                return (
                  <div
                    key={product.id}
                    className="border rounded-xl p-4"
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">
                          {product.name}
                        </h3>

                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {formatMoney(product.price)}
                        </p>
                      </div>

                      <span className="text-xs text-slate-500">
                        Stock: {product.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">

                      <div className="flex items-center gap-2">
                        <button
                          disabled={quantity === 0}
                          onClick={() =>
                            updateQuantity(product, quantity - 1)
                          }
                          className="border rounded-lg p-2 disabled:opacity-30"
                        >
                          <Minus size={15} />
                        </button>

                        <input
                          type="number"
                          min="0"
                          max={product.quantity}
                          value={quantity}
                          onChange={(e) =>
                            updateQuantity(
                              product,
                              e.target.value
                            )
                          }
                          className="border rounded-lg w-14 text-center py-1.5"
                        />

                        <button
                          disabled={quantity >= product.quantity}
                          onClick={() => addToCart(product)}
                          className="border rounded-lg p-2 text-blue-600 disabled:opacity-30"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0 ||
                          quantity >= product.quantity}
                        className="text-xs font-semibold text-blue-600 disabled:text-slate-300"
                      >
                        Add
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* CART / BILL SECTION */}

        <div className="bg-white border rounded-xl p-5 h-fit lg:sticky lg:top-24">

          <div className="flex items-center gap-2 mb-5">
            <ShoppingCart className="text-blue-600" />
            <h2 className="font-bold text-lg">
              Customer Bill
            </h2>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium block mb-2">
              Customer Name (optional)
            </label>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full border rounded-lg p-2.5"
            />
          </div>

          <div className="border-t border-b py-4 space-y-4 max-h-72 overflow-y-auto">

            {selectedItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart size={30} className="mx-auto mb-2" />
                <p className="text-sm">
                  No products selected
                </p>
                <p className="text-xs mt-1">
                  Add products to start billing.
                </p>
              </div>
            ) : (
              selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">

                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.selectedQuantity} × {formatMoney(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {formatMoney(item.lineTotal)}
                    </span>

                    <button
                      onClick={() => updateQuantity(item, 0)}
                      className="text-red-500"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>

          <div className="space-y-3 py-4">

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div>
              <label className="text-sm text-slate-500 block mb-2">
                Discount (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-blue-600">
                {formatMoney(Math.max(0, total))}
              </span>
            </div>

          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-3">
              {error}
            </p>
          )}

          <button
            onClick={createBill}
            disabled={
              submitting ||
              selectedItems.length === 0 ||
              discountValue > subtotal ||
              discountValue < 0
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-40"
          >
            <Receipt size={18} />

            {submitting
              ? "Generating Bill..."
              : "Payment Received — Create Bill"}
          </button>

          <p className="text-xs text-slate-400 text-center mt-3">
            Confirm only after receiving payment. This creates the bill and deducts stock.
          </p>

        </div>
      </div>
    </div>
  );
}

