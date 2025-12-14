"use client";

import { useState } from "react";
import { ShoppingCart, Tag, IndianRupee, Boxes, Minus, Plus } from "lucide-react";

export default function SweetCard({ sweet, onPurchase, isAdmin, onEdit, onDelete }: any) {
  const [qty, setQty] = useState(1);

  return (
    <div
      className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg 
                 p-6 min-h-[380px] flex flex-col justify-between
                 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 h-14">
          <Tag size={22} className="text-white/80" />
          <h2 className="text-xl font-medium text-white capitalize">
            {sweet.name}
          </h2>
        </div>

        <div>
          <div className="text-lg text-white/70 mb-1 ml-1">Category</div>
          <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 h-14">
            <Boxes size={22} className="text-white/70" />
            <p className="text-white text-xl">{sweet.category}</p>
          </div>
        </div>

        <div>
          <div className="text-lg text-white/70 mb-1 ml-1">Price</div>
          <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 h-14">
            <IndianRupee size={22} className="text-white/70" />
            <p className="text-white text-xl">{sweet.price}</p>
          </div>
        </div>

        <div>
          <div className="text-lg text-white/70 mb-1 ml-1">Stock Left</div>
          <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 h-14">
            <Boxes size={22} className="text-white/70" />
            <p className="text-white text-xl">{sweet.quantity}</p>
          </div>
        </div>

        <div>
          <div className="text-lg text-white/70 mb-1 ml-1">Buy Quantity</div>
          <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 h-14 gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="text-white cursor-pointer"
            >
              <Minus />
            </button>

            <input
              type="number"
              min={1}
              max={sweet.quantity}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(
                    Math.max(1, Number(e.target.value)),
                    sweet.quantity
                  )
                )
              }
              className="w-20 text-center bg-transparent text-white text-xl outline-none"
            />

            <button
              onClick={() => setQty((q) => Math.min(sweet.quantity, q + 1))}
              className="text-white cursor-pointer"
            >
              <Plus />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <button
          onClick={() => onPurchase({ ...sweet }, qty)} // ✅ CLONE
          disabled={sweet.quantity <= 0}
          className={`w-full py-3 rounded-xl text-lg font-medium transition-all duration-300 ${
            sweet.quantity > 0
              ? "bg-gradient-to-r from-pink-600 to-purple-700 text-white hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              : "bg-white/20 text-white/50 cursor-not-allowed"
          }`}
        >
          Purchase
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit({ ...sweet })} // ✅ CLONE
              className="w-full py-2 rounded-xl text-lg font-medium text-white
                         bg-gradient-to-r from-green-300 to-green-700
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                         cursor-pointer"
            >
              Update
            </button>

            <button
              onClick={() => onDelete(sweet.id)}
              className="w-full py-2 rounded-xl text-lg font-medium text-white
                         bg-gradient-to-r from-red-300 to-red-800
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                         cursor-pointer"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
