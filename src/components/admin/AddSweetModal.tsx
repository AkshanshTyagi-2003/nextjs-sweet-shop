"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";

interface AddSweetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSweetModal({
  open,
  onClose,
  onSuccess,
}: AddSweetModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name || !category || !price || !quantity) {
      setToast({ msg: "All fields are required", type: "error" });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      setToast({ msg: "Price and quantity must be greater than zero", type: "error" });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setLoading(true);

    const { ok, data } = await apiRequest("POST", "/api/admin/sweets", {
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
    });

    setLoading(false);

    if (!ok) {
      setToast({
        msg: data?.error || "Failed to add item",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    // Close modal immediately
    onClose();

    // Show toast on dashboard
    setToast({ msg: "Item Added Successfully", type: "success" });

    setTimeout(() => {
      setToast(null);
      setName("");
      setCategory("");
      setPrice("");
      setQuantity("");
      onSuccess();
    }, 5000);
  };

  return (
    <>
      {/* ✅ DASHBOARD TOAST (TOP RIGHT, ABOVE EVERYTHING) */}
      {toast && (
        <div className="fixed top-28 right-6 bg-white px-5 py-3 rounded-xl shadow-lg z-[9999]">
          <p
            className={
              toast.type === "success"
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {toast.msg}
          </p>
        </div>
      )}

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
          onClick={onClose}
        />
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl 
                       p-6 w-[500px]"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Add New Sweet
            </h2>

            <div className="space-y-5">
              <div>
                <div className="text-lg text-white/70 mb-1 ml-1">Name</div>
                <div className="bg-white/10 rounded-xl px-4 h-14 flex items-center">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white text-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-lg text-white/70 mb-1 ml-1">Category</div>
                <div className="bg-white/10 rounded-xl px-4 h-14 flex items-center">
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent text-white text-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-lg text-white/70 mb-1 ml-1">Price</div>
                <div className="bg-white/10 rounded-xl px-4 h-14 flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent text-white text-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-lg text-white/70 mb-1 ml-1">Quantity</div>
                <div className="bg-white/10 rounded-xl px-4 h-14 flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-transparent text-white text-lg outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-lg font-medium text-white
                           bg-gradient-to-r from-red-300 to-red-800
                           transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                           cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-lg font-medium text-white
                           bg-gradient-to-r from-green-300 to-green-800
                           transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                           cursor-pointer"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
