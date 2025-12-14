"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { apiRequest } from "../../lib/api";

// 1. IMPORT PDF LIBRARIES (MUST BE INSTALLED)
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // <-- IMPORT THE AUTOTABLE PLUGIN (MUST BE INSTALLED)
import html2canvas from 'html2canvas';

// 2. LUCIDE ICONS
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  FileText, // For PDF
  FileSpreadsheet // For Excel
} from "lucide-react";

// --- TYPES (Keep existing types) ---
type UserRow = {
  name: string;
  email: string;
  role: string;
  id?: string;
};

type SweetRow = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  id?: string;
};

type OrderRow = {
  userName: string;
  userEmail: string;
  userRole: string;
  sweetName: string;
  sweetCategory: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  id?: string; 
};

type DataRow = UserRow | SweetRow | OrderRow;

// --- CONSTANTS ---
const PAGE_SIZE = 10;
const PAGE_RANGE = 5; // Number of page buttons to show

// --- COMPONENT START ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "sweets" | "orders">("users");
  const [data, setData] = useState<DataRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New states for Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };
  
  // --- DATA LOADING ---
  const loadData = useCallback(async (tab: typeof activeTab) => {
    setLoading(true);
    setPage(1);
    setData([]);
    setSearchTerm("");
    setStartDate("");
    setEndDate("");

    let endpoint = "";
    if (tab === "users") {
      endpoint = "/api/admin/users";
    } else if (tab === "sweets") {
      endpoint = "/api/sweets";
    } else if (tab === "orders") {
      endpoint = "/api/admin/orders";
    }

    try {
      const { data: newData } = await apiRequest("GET", endpoint);
      setData(newData || []);
    } catch (e) {
      console.error(`Failed to load ${tab}:`, e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    // Setup date range filter
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return data.filter((row: any) => {
      // 1. Text Search Filter (Dynamic based on tab)
      let matchesSearch = false;
      if (activeTab === "users") {
        matchesSearch = (row as UserRow).name?.toLowerCase().includes(lowerCaseSearch) || 
                          (row as UserRow).email?.toLowerCase().includes(lowerCaseSearch) ||
                          (row as UserRow).role?.toLowerCase().includes(lowerCaseSearch);
      } else if (activeTab === "sweets") {
        matchesSearch = (row as SweetRow).name?.toLowerCase().includes(lowerCaseSearch) || 
                          (row as SweetRow).category?.toLowerCase().includes(lowerCaseSearch);
      } else if (activeTab === "orders") {
        matchesSearch = (row as OrderRow).userName?.toLowerCase().includes(lowerCaseSearch) || 
                          (row as OrderRow).userEmail?.toLowerCase().includes(lowerCaseSearch) ||
                          (row as OrderRow).sweetName?.toLowerCase().includes(lowerCaseSearch) ||
                          (row as OrderRow).sweetCategory?.toLowerCase().includes(lowerCaseSearch);
      }
      
      if (!searchTerm) matchesSearch = true; // No search term = all match

      // 2. Date Range Filter (Only applies to 'orders')
      let matchesDate = true;
      if (activeTab === "orders" && (startDate || endDate)) {
        const orderDate = new Date((row as OrderRow).createdAt);
        const isAfterStart = !start || orderDate >= start;
        const isBeforeEnd = !end || orderDate <= end;
        matchesDate = isAfterStart && isBeforeEnd;
      }

      return matchesSearch && matchesDate;
    });
  }, [data, activeTab, searchTerm, startDate, endDate]);

  useEffect(() => {
    // Reset page to 1 whenever the filtered list changes
    setPage(1);
  }, [filteredData.length]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(start, start + PAGE_SIZE);

  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handlePageChange = (p: number) => setPage(p);

  // --- DOWNLOAD LOGIC ---

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }

    let headers: string[];
    let csvRows: string[];
    let filename: string;
    
    // Dynamically set headers and data based on the active tab
    if (activeTab === "users") {
      headers = ["Name", "Email", "Role"];
      csvRows = filteredData.map(row => {
        const user = row as UserRow;
        // Escape content with double quotes for safety in CSV
        return [`"${user.name.replace(/"/g, '""')}"`, `"${user.email.replace(/"/g, '""')}"`, `"${user.role.replace(/"/g, '""')}"`].join(',');
      });
      filename = 'users_report.csv';
    } else if (activeTab === "sweets") {
      headers = ["Name", "Category", "Price (₹)", "Quantity"];
      csvRows = filteredData.map(row => {
        const sweet = row as SweetRow;
        return [`"${sweet.name.replace(/"/g, '""')}"`, `"${sweet.category.replace(/"/g, '""')}"`, sweet.price.toFixed(2), sweet.quantity.toString()].join(',');
      });
      filename = 'sweets_report.csv';
    } else if (activeTab === "orders") {
      headers = [
        "User Name", "User Email", "User Role", "Sweet Name", "Category", 
        "Price Per Unit (₹)", "Quantity", "Total Price (₹)", "Purchased At"
      ];
      csvRows = filteredData.map(row => {
        const order = row as OrderRow;
        return [
          `"${order.userName.replace(/"/g, '""')}"`, `"${order.userEmail.replace(/"/g, '""')}"`, `"${order.userRole.replace(/"/g, '""')}"`,
          `"${order.sweetName.replace(/"/g, '""')}"`, `"${order.sweetCategory.replace(/"/g, '""')}"`, 
          order.pricePerUnit.toFixed(2), order.quantity.toString(), order.totalPrice.toFixed(2),
          `"${new Date(order.createdAt).toLocaleString().replace(/"/g, '""')}"`
        ].join(',');
      });
      filename = 'orders_report.csv';
    } else {
        return; // Should not happen
    }
    
    // Add BOM for proper UTF-8 handling in Excel
    const BOM = "\uFEFF"; 
    const csvData = BOM + [headers.join(','), ...csvRows].join('\n');
    downloadFile(csvData, filename, 'text/csv;charset=utf-8;');
    showSuccessModal(`Successfully ${activeTab.toUpperCase()} Exported to Excel`);
  };

  /**
   * UPDATED: Uses html2canvas similar to OrdersPage for proper PDF generation with 10 rows per page
   */
  const handleDownloadPDF = async () => {
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }

    // Temporarily create a non-paginated table for printing/capturing
    const tableContainer = document.createElement('div');
    tableContainer.style.width = 'fit-content';
    tableContainer.style.backgroundColor = 'white';
    tableContainer.style.padding = '10px';
    
    let tableHTML = '';
    let title = `${activeTab.toUpperCase()} Report`;
    
    // Construct the full table HTML using all filtered data
    if (activeTab === "users") {
      tableHTML = `
        <style>
            table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 8pt; color: #000; white-space: nowrap; }
            th { background-color: #f0f0f0; font-weight: bold; }
        </style>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(row => {
                  const user = row as UserRow;
                  return `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
      `;
    } else if (activeTab === "sweets") {
      tableHTML = `
        <style>
            table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 8pt; color: #000; white-space: nowrap; }
            th { background-color: #f0f0f0; font-weight: bold; }
        </style>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(row => {
                  const sweet = row as SweetRow;
                  return `
                    <tr>
                        <td>${sweet.name}</td>
                        <td>${sweet.category}</td>
                        <td>₹${sweet.price}</td>
                        <td>${sweet.quantity}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
      `;
    } else if (activeTab === "orders") {
      title = `ORDERS Report (${startDate} to ${endDate || new Date().toLocaleDateString()})`;
      tableHTML = `
        <style>
            table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 8pt; color: #000; white-space: nowrap; }
            th { background-color: #f0f0f0; font-weight: bold; }
        </style>
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Sweet</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Purchased At</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(row => {
                  const order = row as OrderRow;
                  return `
                    <tr>
                        <td>${order.userName}</td>
                        <td>${order.userEmail}</td>
                        <td>${order.userRole}</td>
                        <td>${order.sweetName}</td>
                        <td>${order.sweetCategory}</td>
                        <td>₹${order.pricePerUnit}</td>
                        <td>${order.quantity}</td>
                        <td>₹${order.totalPrice}</td>
                        <td>${new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
      `;
    }
    
    tableContainer.innerHTML = tableHTML;
    document.body.appendChild(tableContainer);

    try {
        const canvas = await html2canvas(tableContainer, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Use Landscape ('l') orientation
        const pdf = new jsPDF('l', 'mm', 'a4'); 
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const ratio = canvasWidth / canvasHeight;
        
        let newWidth = pdfWidth;
        let newHeight = pdfWidth / ratio;

        if (newHeight > pdfHeight) {
            newHeight = pdfHeight;
            newWidth = pdfHeight * ratio;
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, newWidth, newHeight);
        pdf.save(`${activeTab}_report_${new Date().toISOString().slice(0, 10)}.pdf`);

        showSuccessModal(`Successfully ${activeTab.toUpperCase()} Exported to PDF`);

    } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Failed to generate PDF. Check console for details.");
    } finally {
        if (tableContainer.parentNode) {
            tableContainer.parentNode.removeChild(tableContainer);
        }
    }
  };
  
  // --- RENDERING HELPERS (No change needed here) ---

  const renderTableHeaders = () => {
    if (activeTab === "users") {
      return (
        <tr>
          <th className="p-3">Name</th>
          <th className="p-3">Email</th>
          <th className="p-3">Role</th>
        </tr>
      );
    } else if (activeTab === "sweets") {
      return (
        <tr>
          <th className="p-3">Name</th>
          <th className="p-3">Category</th>
          <th className="p-3">Price</th>
          <th className="p-3">Quantity</th>
        </tr>
      );
    } else if (activeTab === "orders") {
      return (
        <tr>
          <th className="p-3">User</th>
          <th className="p-3">Email</th>
          <th className="p-3">Role</th>
          <th className="p-3">Sweet</th>
          <th className="p-3">Category</th>
          <th className="p-3">Price</th>
          <th className="p-3">Qty</th>
          <th className="p-3">Total</th>
          <th className="p-3">Time</th>
        </tr>
      );
    }
    return null;
  };

  const renderTableRows = () => {
    return paginatedData.map((row: any, i) => (
      // Using a combination of row index and a stable ID if available for a robust key
      <tr key={row.id || i} className="text-center border-b border-white/10 hover:bg-white/10 transition-colors duration-200">
        {activeTab === "users" && (
          <>
            <td className="p-3">{row.name}</td>
            <td className="p-3">{row.email}</td>
            <td className="p-3">{row.role}</td>
          </>
        )}

        {activeTab === "sweets" && (
          <>
            <td className="p-3 capitalize">{row.name}</td>
            <td className="p-3">{row.category}</td>
            <td className="p-3">₹{row.price}</td>
            <td className="p-3">{row.quantity}</td>
          </>
        )}

        {activeTab === "orders" && (
          <>
            <td className="p-3">{row.userName}</td>
            <td className="p-3">{row.userEmail}</td>
            <td className="p-3">{row.userRole}</td>
            <td className="p-3">{row.sweetName}</td>
            <td className="p-3">{row.sweetCategory}</td>
            <td className="p-3">₹{row.pricePerUnit}</td>
            <td className="p-3">{row.quantity}</td>
            <td className="p-3 font-semibold">₹{row.totalPrice}</td>
            <td className="p-3 text-sm">
              {new Date(row.createdAt).toLocaleString()}
            </td>
          </>
        )}
      </tr>
    ));
  };

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages < 1) return null;

    let startPage = Math.max(1, page - Math.floor(PAGE_RANGE / 2));
    let endPage = Math.min(totalPages, page + Math.floor(PAGE_RANGE / 2));

    // Adjust start and end to always show PAGE_RANGE buttons if possible
    if (endPage - startPage + 1 < PAGE_RANGE) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, PAGE_RANGE);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - PAGE_RANGE + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${i === page
              ? 'bg-white text-purple-700 shadow-lg'
              : 'text-white hover:bg-white/20'
            }
          `}
          disabled={i === page}
        >
          {i}
        </button>
      );
    }
    return pages;
  };
  
  const ExportButtons = () => {
    const commonClasses = `
      flex items-center space-x-2 px-4 py-2 font-medium rounded-xl 
      transition-colors text-sm 
      cursor-pointer 
      disabled:opacity-50 disabled:cursor-not-allowed
      h-10 
    `;

    return (
      <div className="flex space-x-4 flex-wrap justify-end">
        {/* Download PDF Button - Green */}
        <button
          onClick={handleDownloadPDF}
          disabled={loading || filteredData.length === 0}
          className={`${commonClasses} bg-green-600 text-white hover:bg-green-700`}
        >
          <FileText className="w-5 h-5" />
          <span className="hidden sm:inline">Download PDF</span>
        </button>

        {/* Download Excel Button - Blue */}
        <button
          onClick={handleDownloadExcel}
          disabled={loading || filteredData.length === 0}
          className={`${commonClasses} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="hidden sm:inline">Download Excel</span>
        </button>
      </div>
    );
  };
  
  // --- MAIN RENDER ---

  return (
    <div className="flex min-h-screen">
      
      {/* Success Modal/Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl bg-green-500/90 text-white font-semibold transition-opacity duration-300">
          {successMessage}
        </div>
      )}

      <Sidebar isAdmin={true} />

      <main className="flex-1 min-h-screen bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900">
        
        {/* TOP BAR */}
        <div className="px-6 py-4 shadow bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900">
          <div className="flex justify-between items-center">
              <h1 className="text-4xl font-medium text-white font-serif">
                Admin Panel
              </h1>
          </div>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex gap-6 px-10 pt-10">
          {["users", "sweets", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl text-lg font-medium transition cursor-pointer
                ${
                  activeTab === tab
                    ? "bg-white text-purple-700 shadow-xl"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FILTERS AND EXPORT SECTION (UPDATED LAYOUT) */}
        <div className="px-10 pt-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
            
            {/* Filtering Controls (Search and Date) - Left/Top Block */}
            <div className="flex flex-col sm:flex-row gap-4 items-end w-full lg:w-auto flex-grow">
              
              {/* Search Input */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="text"
                  placeholder={`Filter by ${activeTab === 'users' ? 'Name, Email, or Role' : activeTab === 'sweets' ? 'Name or Category' : 'User, Sweet, or Email'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full py-2 pl-10 pr-4 
                    bg-white/10 text-white 
                    placeholder-white/50 
                    rounded-xl border border-white/20 
                    focus:outline-none focus:ring-2 focus:ring-white/50
                    transition-all duration-200
                  "
                />
              </div>
              
              {/* Date Filters Container (Only visible for Orders tab) */}
              {activeTab === "orders" && (
                <div className="flex space-x-4 items-end w-full sm:w-auto">
                  
                  {/* Start Date */}
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="
                          py-2 px-4 pr-8 h-10
                          bg-white/10 text-white 
                          rounded-xl border border-white/20 
                          focus:outline-none focus:ring-2 focus:ring-white/50
                          transition-all duration-200
                          appearance-none cursor-pointer
                      "
                      title="Start Date"
                      // Trick to show placeholder color when value is empty
                      style={{ color: startDate ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                  </div>

                  {/* End Date */}
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="
                          py-2 px-4 pr-8 h-10
                          bg-white/10 text-white 
                          rounded-xl border border-white/20 
                          focus:outline-none focus:ring-2 focus:ring-white/50
                          transition-all duration-200
                          appearance-none cursor-pointer
                      "
                      title="End Date"
                      style={{ color: endDate ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Export Buttons - Right/Bottom Block */}
            <div className="w-full lg:w-auto pt-2 lg:pt-0">
                <ExportButtons />
            </div>

            </div>
            
            <p className="text-white/70 text-sm mt-2">
                {filteredData.length} {activeTab} found
            </p>
        </div>

        {/* TABLE AREA */}
        <div className="px-10 pb-8 overflow-x-auto">
          {loading && (
            <div className="text-center text-white/70 mt-10">
              Loading {activeTab}...
            </div>
          )}

          {!loading && filteredData.length === 0 && (
            <div className="text-white/70 text-center mt-10">
              No {activeTab} found matching the current filters.
            </div>
          )}
          
          {!loading && filteredData.length > 0 && (
            <table className="w-full text-white border-collapse table-auto min-w-max">
              <thead className="bg-white/20 backdrop-blur-sm sticky top-0">
                {renderTableHeaders()}
              </thead>

              <tbody>
                {renderTableRows()}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION (Updated to match OrdersPage style) */}
        <div className="flex justify-center items-center space-x-2 py-4">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || filteredData.length === 0} 
            className="
              p-2 rounded-full text-white/80 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-white/20
            "
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex space-x-1">
            {renderPageNumbers()}
          </div>

          <button
            onClick={handleNextPage}
            disabled={page === totalPages || filteredData.length === 0}
            className="
              p-2 rounded-full text-white/80 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-white/20
            "
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}