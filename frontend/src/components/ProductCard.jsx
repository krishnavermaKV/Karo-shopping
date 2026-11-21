
import { Package, IndianRupee, Boxes } from "lucide-react";

export default function ProductCard({ product, onSelect, selectedQuantity }) {
  const lowStock = product.quantity <= 10;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">

      <div className="flex items-start justify-between">
        <div className="bg-blue-50 p-3 rounded-lg">
          <Package className="text-blue-600" size={22} />
        </div>

        {lowStock && (
          <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">
            Low stock
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-900 mt-4">
        {product.name}
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        {product.category_name || "Uncategorized"}
      </p>

      <div className="flex items-center justify-between mt-4">
        <span className="flex items-center text-blue-700 font-bold">
          <IndianRupee size={16} />
          {Number(product.price).toFixed(2)}
        </span>

        <span className="flex items-center gap-1 text-sm text-slate-600">
          <Boxes size={15} />
          {product.quantity} pcs
        </span>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(product)}
          disabled={product.quantity <= 0}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-2 rounded-lg text-sm font-medium"
        >
          {selectedQuantity > 0
            ? `Add more (${selectedQuantity} selected)`
            : "Add to bill"}
        </button>
      )}
    </div>
  );
}
