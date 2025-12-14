"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { Search, ChevronLeft, ChevronRight, Calendar, FileText, FileSpreadsheet } from "lucide-react"; 

// 1. IMPORT PDF LIBRARIES (MUST BE INSTALLED)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Ensure type Order is kept
type Order = {
  id: string;
  userName: string;
  userEmail: string;
  sweetName: string;
  sweetCategory: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
};

// CONSTANTS
const ITEMS_PER_PAGE = 10;

// --- CSS for Print Optimization (ONLY USED FOR window.print() fallback, but kept as component name suggests) ---
const PrintStyles = () => (
  <style jsx global>{`
    @media print {
      /* Hide elements not needed for printing (Sidebar, Filters, Pagination, Export Buttons) */
      .no-print,
      .sidebar-container,
      .top-bar {
        display: none !important;
      }

      /* Force landscape orientation for wide tables */
      @page {
        size: landscape;
      }

      /* Make the main content take up full width and force small font */
      body, main {
        margin: 0 !important;
        padding: 0 !important;
        background-color: white !important; 
        font-size: 8pt !important; /* Extremely small font for fit */
      }
      .printable-area {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
      }

      /* Adjustments for readability and fit */
      .printable-area, 
      .printable-area * {
        color: #000 !important; 
        text-shadow: none !important;
        box-shadow: none !important;
      }

      .printable-area table {
        width: 100% !important;
        font-size: 8pt; 
        border-collapse: collapse !important;
      }
      /* Ensure table borders and headers are visible and dark */
      .printable-area thead {
          background-color: #f0f0f0 !important; 
          -webkit-print-color-adjust: exact;
          color: #000 !important; 
      }
      .printable-area table,
      .printable-area th,
      .printable-area td {
        border: 1px solid #999 !important; 
        border-color: #999 !important; 
        -webkit-print-color-adjust: exact;
        padding: 2px 4px !important; /* Tighter padding */
        white-space: nowrap; /* Prevent wrapping in cells */
      }
      
      /* Force all data from the table onto a single page (if possible) */
      .overflow-x-auto {
          overflow: visible !important;
      }
    }
  `}</style>
);
// -----------------------------------------------------------------

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for modal

  // New state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(""); // State for date filter start
  const [endDate, setEndDate] = useState(""); // State for date filter end

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/my");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to show the success modal
  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000); // Hide after 5 seconds
  };

  // --- FILTERING AND PAGINATION LOGIC ---

  const filteredOrders = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (end) {
        end.setHours(23, 59, 59, 999);
    }
    
    const newFilteredOrders = orders.filter((order) => {
      // 1. Text Search Filter
      const matchesSearch = 
        !searchTerm || 
        order.sweetName.toLowerCase().includes(lowerCaseSearch) ||
        order.sweetCategory.toLowerCase().includes(lowerCaseSearch) ||
        order.userEmail.toLowerCase().includes(lowerCaseSearch);

      // 2. Date Range Filter
      const orderDate = new Date(order.createdAt);
      
      const isAfterStart = !start || orderDate >= start;
      const isBeforeEnd = !end || orderDate <= end;
      
      const matchesDate = isAfterStart && isBeforeEnd;

      return matchesSearch && matchesDate;
    });

    return newFilteredOrders;
  }, [orders, searchTerm, startDate, endDate]);

  useEffect(() => {
    // Reset page to 1 whenever the filtered list changes (i.e., when filters change)
    setCurrentPage(1);
  }, [filteredOrders.length]);
  
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // --- DOWNLOAD HANDLERS ---
  
  // Function to create a downloadable anchor tag and click it
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
    if (filteredOrders.length === 0) {
      alert("No data to export.");
      return;
    }
    
    const headers = [
      "User Name", "User Email", "Sweet Name", "Category", 
      "Price Per Unit (₹)", "Quantity", "Total Price (₹)", "Purchased At"
    ].join(',');
    
    const csvRows = filteredOrders.map(order => [
      `"${order.userName}"`,
      `"${order.userEmail}"`,
      `"${order.sweetName}"`,
      `"${order.sweetCategory}"`,
      order.pricePerUnit.toFixed(2),
      order.quantity,
      order.totalPrice.toFixed(2),
      `"${new Date(order.createdAt).toLocaleString()}"`
    ].join(','));
    
    const csvData = [headers, ...csvRows].join('\n');
    
    downloadFile(csvData, 'orders_export.csv', 'text/csv;charset=utf-8;');
    showSuccessModal("Successfully Excel Downloaded");
  };

  /**
   * UPDATED: Uses jspdf and html2canvas for direct client-side PDF generation.
   * This handles the requirement for a direct download without a print dialog
   * and ensures all currently filtered data is captured, regardless of pagination.
   */
  const handleDownloadPDF = async () => {
    if (filteredOrders.length === 0) {
      alert("No data to export.");
      return;
    }

    // Temporarily create a non-paginated table for printing/capturing
    const tableContainer = document.createElement('div');
    tableContainer.style.width = 'fit-content'; // Allow content to dictate width
    tableContainer.style.backgroundColor = 'white'; // Ensure white background for capture
    tableContainer.style.padding = '10px';
    
    // Construct the full table HTML using all filtered data
    const tableHTML = `
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
                    <th>Sweet</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Purchased At</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>${order.userName}</td>
                        <td>${order.userEmail}</td>
                        <td>${order.sweetName}</td>
                        <td>${order.sweetCategory}</td>
                        <td>₹${order.pricePerUnit}</td>
                        <td>${order.quantity}</td>
                        <td>₹${order.totalPrice}</td>
                        <td>${new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    document.body.appendChild(tableContainer); // Append off-screen temporarily

    try {
        const canvas = await html2canvas(tableContainer, {
            scale: 2, // Higher scale for better quality
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Use Landscape ('l') orientation
        const pdf = new jsPDF('l', 'mm', 'a4'); 
        
        // Calculate dimensions to fit the whole canvas onto one PDF page (A4 landscape: 297mm x 210mm)
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate aspect ratio
        const ratio = canvasWidth / canvasHeight;
        
        let newWidth = pdfWidth;
        let newHeight = pdfWidth / ratio;

        // If the height exceeds the page limit, resize based on height instead
        if (newHeight > pdfHeight) {
            newHeight = pdfHeight;
            newWidth = pdfHeight * ratio;
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, newWidth, newHeight);
        pdf.save('orders_report.pdf');

        showSuccessModal("Successfully PDF Downloaded");

    } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Failed to generate PDF. Check console for details.");
    } finally {
        // Clean up the temporary table container
        if (tableContainer.parentNode) {
            tableContainer.parentNode.removeChild(tableContainer);
        }
    }
  };


  // Function to render page numbers
  const renderPageNumbers = () => {
    const pages = [];
    
    if (totalPages < 1) return null;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) endPage = Math.min(totalPages, 5);
    if (currentPage > totalPages - 2) startPage = Math.max(1, totalPages - 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${i === currentPage
              ? 'bg-white text-pink-700 shadow-lg'
              : 'text-white hover:bg-white/20'
            }
          `}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }
    return pages;
  };
  
  // Reusable Export Buttons component
  const ExportButtons = ({ isTop = false }: { isTop?: boolean }) => {
    const commonClasses = `
      flex items-center space-x-2 px-4 py-2 font-medium rounded-xl 
      transition-colors 
      cursor-pointer 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isTop ? 'text-sm' : 'text-base w-full justify-center'}
    `;

    return (
      <div className="flex space-x-4">
        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={filteredOrders.length === 0}
          className={`${commonClasses} bg-red-500 text-white hover:bg-red-600`}
        >
          <FileText className="w-5 h-5" />
          <span>Download PDF</span>
        </button>

        {/* Download Excel Button */}
        <button
          onClick={handleDownloadExcel}
          disabled={filteredOrders.length === 0}
          className={`${commonClasses} bg-green-600 text-white hover:bg-green-700`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Download Excel</span>
        </button>
      </div>
    );
  };

  // --- RENDER COMPONENT ---

  return (
    <div className="flex min-h-screen">
      
      {/* 1. Add Print Styles (Mainly for window.print fallback, though jspdf is used) */}
      <PrintStyles />

      {/* 2. Success Modal/Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl bg-green-500/90 text-white font-semibold transition-opacity duration-300">
          {successMessage}
        </div>
      )}

      {/* 3. Sidebar (Hidden in print via CSS class 'sidebar-container') */}
      <div className="sidebar-container">
        <Sidebar isAdmin={false} />
      </div>

      <main className="flex-1 min-h-screen bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900">
        
        {/* TOP BAR (Hidden in print via CSS class 'top-bar') */}
        <div
          className="
             w-full px-6 py-4 shadow top-bar
             flex items-center
             bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900
          "
        >
          <h1 className="text-4xl font-medium text-white font-serif">
            My Orders
          </h1>
        </div>

        {/* CONTENT AREA */}
        <div className="p-10 printable-area"> {/* Added printable-area class/id to main content wrapper */}
          
          {/* Filter Bar and Export Buttons (Hidden in print via CSS class 'no-print') */}
          <div className="mb-6 flex flex-wrap gap-4 items-end justify-between no-print">
            
            {/* Filtering Controls (Search and Date) */}
            <div className="flex flex-col sm:flex-row gap-4 items-end w-full sm:w-auto flex-grow">
              {/* Search Input */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Filter by Sweet, Category, or Email..."
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
              
              {/* Date Filters Container */}
              <div className="flex space-x-4 items-center">
                
                {/* Start Date */}
                <div className="relative">
                   <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="
                          py-2 px-4 pr-8
                          bg-white/10 text-white 
                          rounded-xl border border-white/20 
                          focus:outline-none focus:ring-2 focus:ring-white/50
                          transition-all duration-200
                          appearance-none
                          dark:text-white dark:bg-white/10 date-input-text
                      "
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
                          py-2 px-4 pr-8
                          bg-white/10 text-white 
                          rounded-xl border border-white/20 
                          focus:outline-none focus:ring-2 focus:ring-white/50
                          transition-all duration-200
                          appearance-none
                          dark:text-white dark:bg-white/10 date-input-text
                      "
                      style={{ color: endDate ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
                   />
                   <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Export Buttons (TOP) and Count */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-start sm:items-center w-full sm:w-auto">
                <p className="text-white/70 text-sm order-last sm:order-first min-w-[120px] text-right">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                </p>
                <ExportButtons isTop={true} />
            </div>
          </div>

          {/* Error and Loading States */}
          {loading && (
            <div className="text-center text-white/70 mt-10">
              Loading your orders...
            </div>
          )}

          {error && (
            <div className="text-center text-red-300 mt-10">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {paginatedOrders.length === 0 && filteredOrders.length === 0 ? (
                <div className="text-white/70 text-center mt-10">
                  {searchTerm || startDate || endDate ? `No orders found matching the current filters.` : 'No orders found.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  
                  <table className="min-w-full table-fixed border border-white/30 rounded-xl border-collapse overflow-hidden">
                    <colgroup>
                      {/* Column widths maintained for UI display */}
                      <col className="w-[180px]" /> 
                      <col className="w-[280px]" />
                      <col className="w-[140px]" />
                      <col className="w-[130px]" />
                      <col className="w-[100px]" />
                      <col className="w-[100px]" />
                      <col className="w-[120px]" />
                      <col className="w-[200px]" />
                    </colgroup>

                    {/* Header */}
                    <thead className="bg-white/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-center text-white/90">User</th>
                        <th className="px-4 py-3 text-center text-white/90">Email</th>
                        <th className="px-4 py-3 text-center text-white/90">Sweet</th>
                        <th className="px-4 py-3 text-center text-white/90">Category</th>
                        <th className="px-4 py-3 text-center text-white/90">Price</th>
                        <th className="px-4 py-3 text-center text-white/90">Quantity</th>
                        <th className="px-4 py-3 text-center text-white/90">Total</th>
                        <th className="px-4 py-3 text-center text-white/90">Purchased At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-white/20 hover:bg-white/10 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-center font-medium truncate text-white">
                            {order.userName}
                          </td>
                          <td className="px-4 py-3 text-center truncate text-white/70">
                            {order.userEmail}
                          </td>
                          <td className="px-4 py-3 text-center truncate text-white">
                            {order.sweetName}
                          </td>
                          <td className="px-4 py-3 text-center truncate text-white">
                            {order.sweetCategory}
                          </td>
                          <td className="px-4 py-3 text-center text-white">
                            ₹{order.pricePerUnit}
                          </td>
                          <td className="px-4 py-3 text-center text-white">
                            {order.quantity}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-white text-lg">
                            ₹{order.totalPrice}
                          </td>
                          <td className="px-4 py-3 text-center text-white/70 text-sm">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls (Hidden in print via CSS class 'no-print') */}
              <div className="flex justify-center items-center space-x-2 mt-8 no-print">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || filteredOrders.length === 0} 
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
                  disabled={currentPage === totalPages || filteredOrders.length === 0}
                  className="
                    p-2 rounded-full text-white/80 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-white/20
                  "
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
            </>
          )}
        </div>
      </main>
    </div>
  );
}