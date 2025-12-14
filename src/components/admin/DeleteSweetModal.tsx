"use client";

import { apiRequest } from "../../lib/api";
import { useState } from "react";

interface DeleteSweetModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sweetId: string | null;
  sweetName?: string;
}

export default function DeleteSweetModal({
  open,
  onClose,
  onConfirm,
  sweetId,
  sweetName,
}: DeleteSweetModalProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleDelete = async () => {
    if (!sweetId) return;

    setLoading(true);

    const { ok, data } = await apiRequest(
      "DELETE",
      `/api/admin/sweets/${sweetId}`
    );

    setLoading(false);

    if (!ok) {
      setToast({
        msg: data?.error || "Failed to delete sweet",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    // ✅ CLOSE MODAL
    onClose();

    // ✅ SHOW DASHBOARD TOAST
    setToast({
      msg: `${sweetName || "Sweet"} deleted successfully`,
      type: "success",
    });

    setTimeout(() => {
      setToast(null);
      onConfirm(); // reload sweets
    }, 5000);
  };

  return (
    <>
      {/* ✅ TOAST (ALWAYS MOUNTED) */}
      {toast && (
        <div className="fixed top-28 right-6 bg-white px-5 py-3 rounded-xl shadow-lg z-50">
          <p className={toast.type === "success" ? "text-green-600" : "text-red-600"}>
            {toast.msg}
          </p>
        </div>
      )}

      {/* ⛔ MODAL UI ONLY WHEN OPEN */}
      {open && sweetId && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* MODAL */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 w-[420px] text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Delete Sweet
              </h2>

              <p className="text-white/80 mb-6">
                Are you sure you want to delete <b>{sweetName}</b>?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl text-white
                             bg-gradient-to-r from-gray-300 to-gray-700
                             transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                             cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl text-white
                             bg-gradient-to-r from-red-300 to-red-800
                             transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                             cursor-pointer"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
