"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import SweetCard from "../../components/SweetCard";
import AddSweetModal from "../../components/admin/AddSweetModal";
import EditSweetModal from "../../components/admin/EditSweetModal";
import DeleteSweetModal from "../../components/admin/DeleteSweetModal";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface SelectedSweet {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  quantityToBuy: number;
}

interface Toast {
  msg: string;
  type: "success" | "error";
}

export default function DashboardPage() {
  const router = useRouter();
  const [sweets, setSweets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<SelectedSweet | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeSweet, setActiveSweet] = useState<any | null>(null);

  async function loadSweets() {
    try {
      const { data } = await apiRequest("GET", "/api/sweets");
      setSweets(data || []);
    } catch (error) {
      console.error("Failed to load sweets:", error);
      setToast({ msg: "Could not load inventory.", type: "error" });
    }
  }

  async function confirmPurchase() {
    if (!selectedSweet) return;

    if (selectedSweet.quantityToBuy <= 0) {
      setToast({ msg: "Purchase failed: Quantity must be greater than zero.", type: "error" });
      setSelectedSweet(null);
      setTimeout(() => setToast(null), 5000);
      return;
    }

    if (selectedSweet.quantityToBuy > selectedSweet.quantityAvailable) {
      setToast({ msg: "Purchase failed: Requested quantity is out of stock.", type: "error" });
      setSelectedSweet(null);
      setTimeout(() => setToast(null), 5000);
      return;
    }

    try {
      const { ok, data } = await apiRequest(
        "POST",
        `/api/sweets/${selectedSweet.id}/purchase`,
        { quantity: selectedSweet.quantityToBuy }
      );

      if (!ok) {
        setToast({ msg: data?.error || "Purchase failed", type: "error" });
      } else {
        setToast({
          msg: `Purchased ${selectedSweet.quantityToBuy}x ${selectedSweet.name} successfully`,
          type: "success",
        });
        loadSweets();
      }
    } catch (error) {
      setToast({ msg: "An unexpected error occurred during purchase.", type: "error" });
    }

    setSelectedSweet(null);
    setTimeout(() => setToast(null), 5000);
  }

  const handlePurchaseClick = (sweet: any, qty: number) => {
    if (sweet.quantity <= 0) {
      setToast({ msg: `${sweet.name} is currently out of stock.`, type: "error" });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setSelectedSweet({
      id: sweet.id,
      name: sweet.name,
      price: sweet.price,
      quantityAvailable: sweet.quantity,
      quantityToBuy: qty,
    });
  };

  const handleEditSweet = (sweet: any) => {
    setActiveSweet({ ...sweet });
    setShowEditModal(true);
  };

  const handleDeleteSweet = (id: string) => {
    const sweet = sweets.find((s) => s.id === id);
    setActiveSweet(sweet);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    loadSweets();

    const flag = localStorage.getItem("login_success");
    if (flag) {
      setShowLoginToast(true);
      localStorage.removeItem("login_success");
      setTimeout(() => setShowLoginToast(false), 5000);
    }

    (async () => {
      try {
        const { ok, data } = await apiRequest("GET", "/api/me");

        /* ✅ THIS IS THE ONLY ADDITION */
        if (!ok) {
          router.push("/login");
          return;
        }

        if (data?.role === "ADMIN") setIsAdmin(true);
      } catch (error) {
        console.error("Failed to check user role:", error);
        router.push("/login");
      }
    })();
  }, []);

  const filtered = sweets.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = selectedSweet ? selectedSweet.price * selectedSweet.quantityToBuy : 0;

  return (
    <div className="flex">
      <Sidebar isAdmin={isAdmin} />

      <main className="flex-1 min-h-screen bg-gradient-to-r from-pink-600 via-pink-500 to-purple-700 relative">
        {(showLoginToast || toast) && (
          <div className="fixed top-28 right-6 bg-white px-5 py-3 rounded-xl shadow-lg z-50">
            <p className={toast?.type === "error" ? "text-red-600" : "text-green-600"}>
              {toast?.msg || "Logged in successfully"}
            </p>
          </div>
        )}

        <Navbar search={search} setSearch={setSearch} />

        {isAdmin && (
          <div className="px-6 pt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-12 py-6 rounded-xl text-2xl font-medium text-white
                         bg-gradient-to-r from-green-300 to-green-800
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                         cursor-pointer"
            >
              Add New Item
            </button>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onPurchase={handlePurchaseClick}
              isAdmin={isAdmin}
              onEdit={handleEditSweet}
              onDelete={handleDeleteSweet}
            />
          ))}
        </div>

        <AddSweetModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadSweets} />
        <EditSweetModal open={showEditModal} sweet={activeSweet} onClose={() => setShowEditModal(false)} onSuccess={loadSweets} />
        <DeleteSweetModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={loadSweets} sweetId={activeSweet?.id || null} sweetName={activeSweet?.name} />

        {selectedSweet && (
          <>
            <div className="fixed inset-0 backdrop-blur-md bg-black/10 z-30"></div>
            {/* REST OF FILE UNCHANGED */}
          </>
        )}
      </main>
    </div>
  );
}
