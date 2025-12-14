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
import { useRouter } from "next/navigation"; // Import for potential sign-out redirection

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
  const router = useRouter(); // Initialize router for navigation
  const [sweets, setSweets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<SelectedSweet | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ SINGLE SOURCE OF TRUTH (for admin modals)
  const [activeSweet, setActiveSweet] = useState<any | null>(null);

  /**
   * Fetches the list of sweets from the API.
   */
  async function loadSweets() {
    try {
      const { data } = await apiRequest("GET", "/api/sweets");
      setSweets(data || []);
    } catch (error) {
      console.error("Failed to load sweets:", error);
      setToast({ msg: "Could not load inventory.", type: "error" });
    }
  }

  /**
   * Handles the confirmation of a sweet purchase.
   */
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
        loadSweets(); // Refresh the list of sweets after purchase
      }
    } catch (error) {
      setToast({ msg: "An unexpected error occurred during purchase.", type: "error" });
    }

    setSelectedSweet(null);
    setTimeout(() => setToast(null), 5000);
  }

  /**
   * Prepares the purchase modal with the selected sweet details.
   */
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

  /**
   * Opens the Edit Sweet modal and sets the active sweet.
   */
  const handleEditSweet = (sweet: any) => {
    // Clone the sweet object to ensure state is updated correctly
    setActiveSweet({ ...sweet });
    setShowEditModal(true);
  };

  /**
   * Opens the Delete Sweet modal and sets the active sweet for confirmation.
   */
  const handleDeleteSweet = (id: string) => {
    const sweet = sweets.find((s) => s.id === id);
    setActiveSweet(sweet);
    setShowDeleteModal(true);
  };

  /**
   * Checks for login success, loads sweets, and checks admin status on component mount.
   */
  useEffect(() => {
    loadSweets();

    // Check for successful login toast
    const flag = localStorage.getItem("login_success");
    if (flag) {
      setShowLoginToast(true);
      localStorage.removeItem("login_success");
      setTimeout(() => setShowLoginToast(false), 5000);
    }

    // Check user role
    (async () => {
      try {
        const { ok, data } = await apiRequest("GET", "/api/me");
        if (ok && data?.role === "ADMIN") setIsAdmin(true);
      } catch (error) {
        console.error("Failed to check user role:", error);
      }
    })();
  }, []);

  // Filter sweets based on search term
  const filtered = sweets.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total price for the purchase confirmation modal
  const total = selectedSweet ? selectedSweet.price * selectedSweet.quantityToBuy : 0;

  return (
    <div className="flex">
      {/* Sidebar Component */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-gradient-to-r from-pink-600 via-pink-500 to-purple-700 relative">

        {/* Toast Notifications */}
        {(showLoginToast || toast) && (
          <div className="fixed top-28 right-6 bg-white px-5 py-3 rounded-xl shadow-lg z-50">
            <p className={toast?.type === "error" ? "text-red-600" : "text-green-600"}>
              {toast?.msg || "Logged in successfully"}
            </p>
          </div>
        )}

        {/* Navbar Component (including search) */}
        <Navbar search={search} setSearch={setSearch} />

        {/* Admin 'Add New Item' Button */}
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

        {/* Sweet Card Grid */}
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

        {/* Admin Modals */}
        <AddSweetModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadSweets}
        />

        <EditSweetModal
          open={showEditModal}
          sweet={activeSweet}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadSweets}
        />

        <DeleteSweetModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={loadSweets}
          sweetId={activeSweet?.id || null}
          sweetName={activeSweet?.name}
        />

        {/* Purchase Confirmation Modal (UPDATED) */}
        {selectedSweet && (
          <>
            <div className="fixed inset-0 backdrop-blur-md bg-black/10 z-30"></div>

            <div className="fixed inset-0 flex items-center justify-center z-40">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg
                             p-6 min-h-[420px] w-[480px] flex flex-col justify-between">

                <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 h-14 mb-6">
                    <ShoppingCart size={22} className="text-white/80" />
                    <h2 className="text-2xl font-semibold text-white capitalize">
                      Confirm Purchase
                    </h2>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 h-14">
                    <span className="text-lg text-white/70">Item</span>
                    <p className="text-white text-xl font-medium">{selectedSweet.name}</p>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 h-14">
                    <span className="text-lg text-white/70">Remaining Stock</span>
                    <p className="text-white text-xl font-medium">
                      {selectedSweet.quantityAvailable}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 h-14">
                    <span className="text-lg text-white/70">Price / Unit</span>
                    <p className="text-white text-xl font-medium">
                      ₹{selectedSweet.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 h-14">
                    <span className="text-lg text-white/70">Quantity to Buy</span>
                    <p className="text-white text-xl font-medium">
                      {selectedSweet.quantityToBuy}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white/30 rounded-xl px-4 h-14 mt-6">
                    <span className="text-xl font-semibold text-white">TOTAL</span>
                    <p className="text-white text-2xl font-extrabold">
                      ₹{total}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={confirmPurchase}
                    className="flex-1 py-3 rounded-xl text-lg font-medium text-white
                                   bg-gradient-to-r from-green-300 to-green-800
                                   transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                   cursor-pointer"
                  >
                    Submit
                  </button>

                  <button
                    onClick={() => setSelectedSweet(null)}
                    className="flex-1 py-3 rounded-xl text-lg font-medium text-white
                                   bg-gradient-to-r from-red-300 to-red-800
                                   transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                   cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}