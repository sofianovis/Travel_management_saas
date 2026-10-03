"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Plus, Search, Edit2, Trash2, CalendarCheck, Plane, Building2, Ticket, Car, FileText, Printer, MessageCircle, Download, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";
import { NewBookingModal } from "@/components/NewBookingModal";

export default function BookingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [dateFilter, setDateFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [paymentPrompt, setPaymentPrompt] = useState<{isOpen: boolean, booking: any}>({isOpen: false, booking: null});
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const defaultBookings: any[] = [];

  
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAllData = async () => {
    try {
      const [bookRes, custRes] = await Promise.all([
        apiFetch("http://localhost:4000/bookings", { cache: "no-store" }),
        apiFetch("http://localhost:4000/customers", { cache: "no-store" })
      ]);
      const bookData = await bookRes.json();
      const custData = await custRes.json();
      setBookings(bookData);
      setCustomers(custData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAllData();
  }, []);


  const getIcon = (iconText: string, type: string) => {
    if (iconText === "Plane" || type === "طيران") return <Plane size={16}/>;
    if (iconText === "Hotel" || type === "فندق") return <Building2 size={16}/>;
    if (iconText === "Car" || type === "نقل") return <Car size={16}/>;
    return <FileText size={16}/>;
  };

  const handleSaveBooking = async (booking: any) => {
    try {
      const method = booking.id && bookings.find((b: any) => b.id === booking.id) ? "PATCH" : "POST";
      const url = method === "PATCH" ? `http://localhost:4000/bookings/${booking.id}` : "http://localhost:4000/bookings";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        fetchAllData();
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  
  const handleDelete = async (id: string) => {
    if (confirm("�� ��� ����� �� ��� ��� ����ҿ")) {
      try {
        await apiFetch(`http://localhost:4000/bookings/${id}`, { method: "DELETE" });
        fetchAllData();
      } catch (e) {
        console.error(e);
      }
    }
  };


  
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e: any) => {
    if (e.target.checked) setSelectedIds(filteredBookings.map((b: any) => b.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} حجوزات؟`)) return;
    try {
      await Promise.all(selectedIds.map(id => apiFetch(`http://localhost:4000/bookings/${id}`, { method: "DELETE" })));
      setSelectedIds([]);
      fetchAllData();
    } catch (e) { console.error(e); }
  };

  const handleBulkStatus = async (status: string) => {
    try {
      await Promise.all(selectedIds.map(id => {
        const b = bookings.find((bk:any) => bk.id === id);
        return apiFetch(`http://localhost:4000/bookings/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({...b, status})
        });
      }));
      setSelectedIds([]);
      fetchAllData();
    } catch (e) { console.error(e); }
  };

  const submitPartialPayment = async (e: any) => {
    e.preventDefault();
    try {
      await apiFetch(`http://localhost:4000/bookings/${paymentPrompt.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...paymentPrompt.booking, paymentStatus: "مدفوع جزئياً", paidAmount: parseFloat(paidAmountInput) })
      });
      setPaymentPrompt({ isOpen: false, booking: null });
      fetchAllData();
    } catch(err) { console.error(err); }
  };

  const handleUpdatePaymentStatus = async (id: string, newStatus: string) => {
    const booking = bookings.find((b: any) => b.id === id);
    if (newStatus === "مدفوع جزئياً") {
      setPaymentPrompt({ isOpen: true, booking });
      setPaidAmountInput("");
      return;
    }
    try {
      await apiFetch(`http://localhost:4000/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...booking, paymentStatus: newStatus, paidAmount: newStatus === "مدفوع بالكامل" ? booking.amount : 0 })
      });
      fetchAllData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const booking = bookings.find((b: any) => b.id === id);
      const res = await apiFetch(`http://localhost:4000/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...booking, status: newStatus })
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    const headers = ["رقم الحجز", "العميل", "الهاتف", "الخدمة", "الوجهة", "تاريخ السفر", "PNR", "السعر", "الدفع", "الحالة"];
    const rows = filteredBookings.map((b: any) => [
      b.id, b.customerName, b.phone, b.type + " - " + (b.provider || ""), b.destination, b.date, b.pnr, b.amount, b.paymentStatus, b.status
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = (booking: any) => {
    if (!booking.phone) return alert("لا يوجد رقم هاتف مسجل لهذا العميل.");
    const msg = encodeURIComponent(`مرحباً بك ${booking.customerName}،
هذا تذكير بحجزك:
نوع الخدمة: ${booking.type} - ${booking.provider || ""}
الوجهة: ${booking.destination || ""}
تاريخ السفر: ${booking.date || ""}
${booking.pnr && booking.pnr !== "-" ? `رمز الحجز (PNR): ${booking.pnr}` : ""}

نتمنى لك رحلة سعيدة!`);
    window.open(`https://wa.me/${booking.phone.replace(/^0/, "213")}?text=${msg}`, "_blank");
  };

  const handlePrint = (booking: any) => {
    const printContent = `
      <html lang="ar" dir="rtl">
        <head>
          <title>تذكرة الحجز - ${booking.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1F2937; }
            .ticket-box { border: 2px dashed #DC2626; padding: 30px; border-radius: 15px; max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #DC2626; margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0 0; color: #6b7280; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .col { flex: 1; }
            .label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
            .value { font-size: 16px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
            .badge { background: #f3f4f6; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <div class="header">
              <div>
                <h1>وكالة النزلاء للسياحة والسفر</h1>
                <p>تذكرة إلكترونية / وصل دفع</p>
              </div>
              <div style="text-align: left;">
                <div class="badge">${booking.status}</div>
                <p style="margin-top: 10px; font-weight: bold;">رقم الحجز: ${booking.id}</p>
              </div>
            </div>
            
            <div class="row">
              <div class="col">
                <div class="label">اسم المسافر</div>
                <div class="value">${booking.customer}</div>
              </div>
              <div class="col">
                <div class="label">نوع الخدمة</div>
                <div class="value">${booking.type} - ${booking.provider}</div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="label">الوجهة / التفاصيل</div>
                <div class="value">${booking.destination}</div>
              </div>
              <div class="col">
                <div class="label">تاريخ السفر</div>
                <div class="value">${booking.date}</div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="label">رمز الحجز (PNR)</div>
                <div class="value" style="font-family: monospace; font-size: 18px;">${booking.pnr}</div>
              </div>
              <div class="col">
                <div class="label">الحالة المالية</div>
                <div class="value">${Number(booking.amount).toLocaleString()} د.ج (${booking.paymentStatus})</div>
              </div>
            </div>

            <div class="footer">
              تم إصدار هذه التذكرة آلياً من نظام Elnouzalaa SaaS. شكراً لاختياركم وكالتنا. <br>
              رقم الهاتف: 0555000000 | البريد الإلكتروني: contact@elnouzalaa.dz
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=900,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const openNewBooking = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const getPaymentBadgeColor = (status: string) => {
    if (status === 'مدفوع بالكامل') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'مدفوع جزئياً') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  // Dashboard Stats
  const today = new Date().toISOString().split("T")[0];
  const todayBookingsCount = bookings.filter((b: any) => b.createdAt && b.createdAt.startsWith(today)).length;
  const unpaidTotal = bookings.reduce((sum: number, b: any) => {
    if (b.paymentStatus === "غير مدفوع") return sum + (Number(b.amount) || 0);
    if (b.paymentStatus === "مدفوع جزئياً") return sum + ((Number(b.amount) || 0) - (Number(b.paidAmount) || 0));
    return sum;
  }, 0);
  const pendingCount = bookings.filter((b: any) => b.status === "قيد الانتظار").length;

  const isDateInRange = (dateStr: string, range: string) => {
    if (range === "الكل" || !dateStr) return true;
    const date = new Date(dateStr);
    const now = new Date();
    if (range === "اليوم") {
      return date.toDateString() === now.toDateString();
    }
    if (range === "هذا الأسبوع") {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= pastWeek;
    }
    if (range === "هذا الشهر") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const baseFilteredBookings = bookings.filter((b: any) => {
    const matchesFilter = activeFilter === "الكل" || b.type === activeFilter;
    const matchesSearch = (b.customerName || "").includes(searchQuery) || (b.pnr || "").includes(searchQuery) || b.id.includes(searchQuery);
    const matchesDate = isDateInRange(b.date, dateFilter) || isDateInRange(b.createdAt, dateFilter);
    const matchesPayment = paymentFilter === "الكل" || b.paymentStatus === paymentFilter;
    const matchesStatus = statusFilter === "الكل" || b.status === statusFilter;
    return matchesFilter && matchesSearch && matchesDate && matchesPayment && matchesStatus;
  }).sort((a: any, b: any) => {
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";
    if (sortConfig.key === 'amount') { valA = Number(valA); valB = Number(valB); }
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(baseFilteredBookings.length / itemsPerPage) || 1;
  const filteredBookings = baseFilteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isMounted) return null; // Prevent hydration errors

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Navbar />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">حجوزات اليوم</p>
              <p className="text-2xl font-bold text-gray-800">{todayBookingsCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">المستحقات غير المدفوعة</p>
              <p className="text-2xl font-bold text-gray-800">{unpaidTotal.toLocaleString()} د.ج</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">التذاكر قيد الانتظار</p>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarCheck className="text-primary" /> إدارة الحجوزات
            </h2>
            <p className="text-gray-500 text-sm mt-1">تتبع الحجوزات، إصدار التذاكر، ومتابعة المدفوعات.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition hover:bg-gray-50 font-medium">
              <Download size={20} /> تصدير
            </button>
            <button 
              onClick={openNewBooking}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-medium"
            >
              <Plus size={20} /> حجز جديد (F2)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-max">
              {["الكل", "طيران", "فندق", "تأشيرة", "نقل"].map(filter => (
                <button 
                  key={filter}
                  onClick={() => {setActiveFilter(filter); setCurrentPage(1);}}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
                    activeFilter === filter 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

                        <div className="flex gap-2 w-full md:w-auto">
              <select
                value={dateFilter}
                onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="الكل">كل التواريخ</option>
                <option value="اليوم">اليوم</option>
                <option value="هذا الأسبوع">هذا الأسبوع</option>
                <option value="هذا الشهر">هذا الشهر</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => {setPaymentFilter(e.target.value); setCurrentPage(1);}}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="الكل">كل الدفعات</option>
                <option value="غير مدفوع">غير مدفوع</option>
                <option value="مدفوع جزئياً">مدفوع جزئياً</option>
                <option value="مدفوع بالكامل">مدفوع بالكامل</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="الكل">كل الحالات</option>
                <option value="مؤكد">مؤكد</option>
                <option value="قيد الانتظار">قيد الانتظار</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث بالاسم، PNR، رقم الحجز..." 
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            </div>
          </div>
          {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex justify-between items-center animate-in fade-in mx-6">
            <span className="text-blue-800 font-bold">تم تحديد {selectedIds.length} حجوزات</span>
            <div className="flex gap-2">
              <button onClick={() => handleBulkStatus("مؤكد")} className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600">تأكيد جماعي</button>
              <button onClick={() => handleBulkStatus("ملغى")} className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">إلغاء جماعي</button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center gap-1">حذف جماعي</button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredBookings.length && filteredBookings.length > 0} className="w-4 h-4 text-primary rounded" />
                  </th>
                  <th className="px-6 py-4 font-semibold">رقم الحجز</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('customerName')}>العميل ↕</th>
                  <th className="px-6 py-4 font-semibold">تفاصيل الخدمة</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('date')}>تاريخ السفر ↕</th>
                  <th className="px-6 py-4 font-semibold">PNR</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('amount')}>المالية ↕</th>
                  <th className="px-6 py-4 font-semibold">الحالة</th>
                  <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CalendarCheck size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">لا توجد حجوزات مطابقة</p>
                        <p className="text-sm mt-1">تأكد من كلمات البحث أو قم بإضافة حجز جديد.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b, idx) => {
                    const isUrgent = (b.status === "قيد الانتظار" || b.paymentStatus === "غير مدفوع") && b.date && (new Date(b.date).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000) && (new Date(b.date).getTime() - new Date().getTime() > 0);
                    return (
                    <tr key={idx} className={`${isUrgent ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50/80'} transition group`}>
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelect(b.id)} className="w-4 h-4 text-primary rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">{b.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{b.customerName}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{b.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{getIcon(b.type, b.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{b.destination}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{b.provider}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{b.date}</td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-gray-600">{b.pnr}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{Number(b.amount).toLocaleString()} د.ج</p>
                        <select 
                          value={b.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(b.id, e.target.value)}
                          className={`block mt-1 px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer ${getPaymentBadgeColor(b.paymentStatus)}`}
                        >
                          <option value="غير مدفوع">غير مدفوع</option>
                          <option value="مدفوع جزئياً">مدفوع جزئياً</option>
                          <option value="مدفوع بالكامل">مدفوع بالكامل</option>
                        </select>
                        {b.paymentStatus === 'مدفوع جزئياً' && (
                          <div className="text-[10px] text-gray-500 mt-1 font-bold">المسدد: {b.paidAmount || 0} د.ج</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium outline-none cursor-pointer border ${
                            b.status === 'مؤكد' ? 'bg-green-50 text-green-700 border-green-200' : 
                            b.status === 'ملغى' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          <option value="مؤكد">مؤكد</option>
                          <option value="قيد الانتظار">قيد الانتظار</option>
                          <option value="ملغى">ملغى</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.attachments && b.attachments.includes('http') && (
                            <a href={b.attachments} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition" title="مشاهدة المرفق">
                              <Paperclip size={16} />
                            </a>
                          )}
                          <button onClick={() => handlePrint(b)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="طباعة">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => handleWhatsApp(b)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition" title="إرسال واتساب">
                            <MessageCircle size={16} />
                          </button>
                          <button onClick={() => handleEdit(b)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded transition" title="تعديل">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="إلغاء الحجز">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
              <span className="text-sm text-gray-500">
                إظهار الصفحة {currentPage} من {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}
      </main>

      
      <NewBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveBooking}
        initialData={selectedBooking}
        customers={customers}
      />

    </div>
  );
}
