"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { UmrahOperationsModal } from "@/components/UmrahOperationsModal";
import { Navbar } from "@/components/Navbar";
import { Moon, Plus, Search, Edit2, Trash2, Users, PlaneTakeoff, Building2, MapPin, CalendarDays, CheckCircle, Clock, MessageCircle, FileText } from "lucide-react";

export default function UmrahPage() {
  const defaultPackages = [
    { 
      id: "UM-24-001", name: "عمرة المولد النبوي الشريف", status: "مفتوح",
      flight: "الخطوط الجوية الجزائرية (AH)", departure: "2023-10-15", returnDate: "2023-10-30",
      makkahHotel: "فندق سويس أوتيل المقام", madinahHotel: "فندق دلة طيبة",
      capacity: 50, booked: 32,
      prices: { quad: 185000, triple: 210000, double: 245000 }
    },
    { 
      id: "UM-24-002", name: "عمرة نوفمبر (اقتصادية)", status: "مكتمل",
      flight: "الخطوط السعودية (SV)", departure: "2023-11-05", returnDate: "2023-11-20",
      makkahHotel: "فندق أبراج الكسوة", madinahHotel: "فندق إشراق المدينة",
      capacity: 45, booked: 45,
      prices: { quad: 155000, triple: 175000, double: 205000 }
    },
    { 
      id: "UM-25-001", name: "عمرة شعبان - تجهيز لرمضان", status: "مسودة",
      flight: "طيران ناس (Flynas)", departure: "2024-02-10", returnDate: "2024-02-25",
      makkahHotel: "فندق أنجم مكة", madinahHotel: "فندق بولمان زمزم المدينة",
      capacity: 90, booked: 0,
      prices: { quad: 195000, triple: 220000, double: 260000 }
    },
  ];

  const [packages, setPackages] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");

  const [formData, setFormData] = useState({
    name: "", status: "مسودة", flight: "", departure: "", returnDate: "",
    departurePort: "", arrivalPort: "", departureTime: "", returnTime: "", guideName: "",
    makkahHotel: "", madinahHotel: "", capacity: 50,
    priceQuad: "", priceTriple: "", priceDouble: "",
    costFlight: "", costHotel: "", costVisa: ""
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [operationsPkg, setOperationsPkg] = useState<any>(null);
  const [selectedBookingPackage, setSelectedBookingPackage] = useState<any>(null);
  const [selectedPilgrimForContract, setSelectedPilgrimForContract] = useState<{pkg: any, pilgrim: any} | null>(null);
  
  const [bookingData, setBookingData] = useState({
    customerId: "",
    roomType: "quad",
    isPaid: true,
    visaNumber: "",
    selectedFamilyMembers: [] as string[]
  });

  const [isRemovePilgrimModalOpen, setIsRemovePilgrimModalOpen] = useState(false);
  const [selectedPackageForRemove, setSelectedPackageForRemove] = useState<any>(null);

  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [selectedPackageForManifest, setSelectedPackageForManifest] = useState<any>(null);

  const fetchAllData = async () => {
    try {
      const [umrahRes, custRes, finRes] = await Promise.all([
        fetch("http://localhost:4000/umrah", { cache: "no-store" }),
        fetch("http://localhost:4000/customers", { cache: "no-store" }),
        fetch("http://localhost:4000/finance", { cache: "no-store" })
      ]);
      const [umrahList, custList, finList] = await Promise.all([
        umrahRes.json(), custRes.json(), finRes.json()
      ]);
      setPackages(umrahList);
      setCustomers(custList);
      setFinanceTransactions(finList);
    } catch (e) {
      console.error(e);
      setPackages(defaultPackages);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAllData();
  }, []);

  const openNewModal = () => {
    setSelectedPackage(null);
    setFormData({ 
      name: "", status: "مسودة", flight: "", departure: "", returnDate: "",
      departurePort: "", arrivalPort: "", departureTime: "", returnTime: "", guideName: "",
      makkahHotel: "", madinahHotel: "", capacity: 50,
      priceQuad: "", priceTriple: "", priceDouble: "",
      costFlight: "", costHotel: "", costVisa: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || "", status: pkg.status || "مسودة", flight: pkg.flight || "", 
      departure: pkg.departure || "", returnDate: pkg.returnDate || "",
    departurePort: pkg.departurePort || "", arrivalPort: pkg.arrivalPort || "", 
    departureTime: pkg.departureTime || "", returnTime: pkg.returnTime || "", guideName: pkg.guideName || "",
    makkahHotel: pkg.makkahHotel || "", madinahHotel: pkg.madinahHotel || "", capacity: pkg.capacity || 50,
    priceQuad: pkg.prices?.quad?.toString() || "", 
    priceTriple: pkg.prices?.triple?.toString() || "", 
    priceDouble: pkg.prices?.double?.toString() || "",
    costFlight: pkg.costs?.flight?.toString() || "",
    costHotel: pkg.costs?.hotel?.toString() || "",
    costVisa: pkg.costs?.visa?.toString() || ""
  });
  setIsModalOpen(true);
};

const handleSavePackage = async (e: React.FormEvent) => {
  e.preventDefault();
  const formattedData = {
    name: formData.name, status: formData.status, flight: formData.flight, 
    departure: formData.departure, returnDate: formData.returnDate,
    departurePort: formData.departurePort, arrivalPort: formData.arrivalPort, 
    departureTime: formData.departureTime, returnTime: formData.returnTime, guideName: formData.guideName,
    makkahHotel: formData.makkahHotel, madinahHotel: formData.madinahHotel, 
    capacity: parseInt(formData.capacity.toString()) || 50,
    prices: {
      quad: parseFloat(formData.priceQuad) || 0,
      triple: parseFloat(formData.priceTriple) || 0,
      double: parseFloat(formData.priceDouble) || 0,
    },
    costs: {
      flight: parseFloat(formData.costFlight) || 0,
      hotel: parseFloat(formData.costHotel) || 0,
      visa: parseFloat(formData.costVisa) || 0,
    }
  };

  try {
    if (selectedPackage) {
      const res = await fetch(`http://localhost:4000/umrah/${selectedPackage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      if (res.ok) fetchAllData();
    } else {
      const res = await fetch(`http://localhost:4000/umrah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      if (res.ok) fetchAllData();
    }
  } catch (err) {
    alert("خطأ في الاتصال بالخادم");
  }
  setIsModalOpen(false);
};

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من مسح برنامج العمرة هذا؟ لا يمكن التراجع عن هذه العملية.")) {
      try {
        await fetch(`http://localhost:4000/umrah/${id}`, { method: 'DELETE' });
        fetchAllData();
      } catch (err) {
        alert("خطأ");
      }
    }
  };

  const openBookingModal = (pkg: any) => {
    if (pkg.capacity - (pkg.booked || 0) <= 0) {
      alert("عذراً، هذا البرنامج ممتلئ بالكامل ولا يمكن تسجيل معتمرين إضافيين.");
      return;
    }
    setSelectedBookingPackage(pkg);
    setBookingData({ 
      customerId: "", 
      roomType: "quad",
      isPaid: true,
      visaNumber: "",
      selectedFamilyMembers: []
    });
    setIsBookingModalOpen(true);
  };

  const handleSavePilgrimBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.customerId) {
      alert("يرجى اختيار عميل أولاً من القائمة.");
      return;
    }

    const mainCustomer = customers.find(c => c.id === bookingData.customerId);
    if (!mainCustomer) return;

    // Gather all customers to book (Main + selected family members)
    const membersToBook = [mainCustomer];
    if (bookingData.selectedFamilyMembers && bookingData.selectedFamilyMembers.length > 0) {
      bookingData.selectedFamilyMembers.forEach(fid => {
        const fm = customers.find(c => c.id === fid);
        if (fm) membersToBook.push(fm);
      });
    }

    // Validation
    for (const customer of membersToBook) {
      if (customer?.tags?.includes("محظور (Blacklist)")) {
        alert(`🚫 فشل الحجز: العميل (${customer.name}) مدرج في القائمة السوداء! يرجى مراجعة ملفه.`);
        return;
      }
      const isAlreadyBooked = selectedBookingPackage.pilgrims?.some((p: any) => p.id === customer?.id);
      if (isAlreadyBooked) {
        alert(`⚠️ العميل (${customer.name}) مسجل بالفعل في هذه الرحلة مسبقاً!`);
        return;
      }
    }

    // Check Capacity
    if ((selectedBookingPackage.booked || 0) + membersToBook.length > selectedBookingPackage.capacity) {
      alert("⚠️ لا توجد مقاعد كافية في الرحلة لتسجيل هذه المجموعة.");
      return;
    }

    let pricePerPerson = selectedBookingPackage.prices[bookingData.roomType] || 0;
    
    try {
      const res = await fetch(`http://localhost:4000/umrah/${selectedBookingPackage.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: mainCustomer.id,
          membersToBook,
          roomType: bookingData.roomType,
          isPaid: bookingData.isPaid,
          visaNumber: bookingData.visaNumber,
          pricePerPerson,
          amount: pricePerPerson * membersToBook.length
        })
      });
      
      if (res.ok) {
        alert(`تم تسجيل ${membersToBook.length} معتمرين وخصم المقاعد بنجاح!`);
        fetchAllData(); // Refresh everything from backend
        setIsBookingModalOpen(false);
      } else {
        alert("حدث خطأ أثناء تسجيل الحجز في الخادم.");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ في الاتصال بالخادم");
    }
  };

  const openRemovePilgrimModal = (pkg: any) => {
    if ((pkg.booked || 0) <= 0) {
      alert("هذا البرنامج لا يحتوي على أي معتمرين مسجلين.");
      return;
    }
    setSelectedPackageForRemove(pkg);
    setIsRemovePilgrimModalOpen(true);
  };

  const handleConfirmRemovePilgrim = async (pilgrimIndex: number | null) => {
    const confirmCancel = confirm(
      "هل أنت متأكد من سحب هذا المعتمر وإلغاء حجزه؟\n" +
      "- سيتم إرجاع مقعد للطائرة.\n" +
      "- سيتم توليد وصل 'استرجاع مالي' آلياً في قسم المالية."
    );

    if (confirmCancel && pilgrimIndex !== null) {
      const canceledPilgrim = selectedPackageForRemove.pilgrims[pilgrimIndex];
      const amountToRefund = selectedPackageForRemove.prices[canceledPilgrim.roomType] || 0;

      try {
        const res = await fetch(`http://localhost:4000/umrah/${selectedPackageForRemove.id}/cancel-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pilgrimId: canceledPilgrim.id,
            amountToRefund,
            pilgrimName: canceledPilgrim.name,
            roomType: canceledPilgrim.roomType
          })
        });

        if (res.ok) {
          alert("تم سحب المعتمر وتوليد وصل 'استرجاع أموال' بقيمة " + amountToRefund.toLocaleString() + " د.ج في قسم المالية!");
          fetchAllData();
        } else {
          alert("حدث خطأ أثناء إلغاء الحجز.");
        }
      } catch (err) {
        console.error(err);
        alert("خطأ في الاتصال بالخادم");
      }
      setIsRemovePilgrimModalOpen(false);
    }
  };

  const handleExportExcel = (pkg: any) => {
    if (!pkg.pilgrims || pkg.pilgrims.length === 0) {
      alert("لا يوجد معتمرين لتصديرهم في هذا البرنامج.");
      return;
    }
    
    let csvContent = "\uFEFF";
    csvContent += "الرقم,الاسم الكامل,رقم الجواز,الجنسية,نوع التسكين,رقم الغرفة,حالة التأشيرة,رقم التأشيرة\n";
    
    pkg.pilgrims.forEach((p: any, index: number) => {
      const roomName = p.roomType === 'quad' ? 'رباعية' : p.roomType === 'triple' ? 'ثلاثية' : p.roomType === 'double' ? 'ثنائية' : 'غير محدد';
      const row = [
        index + 1,
        `"${p.name || ""}"`,
        `"${p.passport || ""}"`,
        `"${p.nationality || "جزائري"}"`,
        `"${roomName}"`,
        `"${p.roomNumber || ""}"`,
        `"${p.visaStatus || "قيد المعالجة"}"`,
        `"${p.visaNumber || ""}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `قائمة_المعتمرين_${pkg.name.replace(/ /g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openManifestModal = (pkg: any) => {
    setSelectedPackageForManifest(pkg);
    setIsManifestModalOpen(true);
  };

  
  const handleOperationsUpdate = async (pilgrimId: string, field: string, value: string) => {
    try {
      await fetch(`http://localhost:4000/umrah/pilgrims/${pilgrimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      
      setOperationsPkg((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          pilgrims: prev.pilgrims.map((p: any) => p.id === pilgrimId ? { ...p, [field]: value } : p)
        };
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePilgrimData = async (packageId: string, pilgrimIndex: number, field: string, value: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !pkg.pilgrims || !pkg.pilgrims[pilgrimIndex]) return;

    const pilgrimId = pkg.pilgrims[pilgrimIndex].id;

    // 1. Update in packages list optimistically
    const updatedPackages = packages.map(p => {
      if (p.id === packageId) {
        const newPilgrims = [...(p.pilgrims || [])];
        if (newPilgrims[pilgrimIndex]) {
          newPilgrims[pilgrimIndex] = { ...newPilgrims[pilgrimIndex], [field]: value };
        }
        return { ...p, pilgrims: newPilgrims };
      }
      return p;
    });
    setPackages(updatedPackages);

    // 2. Update the currently selected package for the modal to reflect UI changes instantly
    setSelectedPackageForManifest((prev: any) => {
      if (prev && prev.id === packageId) {
        const newPilgrims = [...(prev.pilgrims || [])];
        if (newPilgrims[pilgrimIndex]) {
          newPilgrims[pilgrimIndex] = { ...newPilgrims[pilgrimIndex], [field]: value };
        }
        return { ...prev, pilgrims: newPilgrims };
      }
      return prev;
    });

    // 3. Send update to backend
    try {
      await fetch(`http://localhost:4000/umrah/pilgrims/${pilgrimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsAppBroadcast = () => {
    if (!selectedPackageForManifest || !selectedPackageForManifest.pilgrims) return;
    
    // Extract phones from customers array based on pilgrim IDs
    const phones = selectedPackageForManifest.pilgrims.map((p: any) => {
      const c = customers.find(cust => cust.id === p.id);
      return c?.phone || "";
    }).filter((phone: string) => phone.length > 5);

    if (phones.length === 0) {
      alert("لا يوجد أرقام هواتف مسجلة لمعتمري هذه الرحلة.");
      return;
    }

    const text = encodeURIComponent(`السلام عليكم معتمرينا الكرام (رحلة: ${selectedPackageForManifest.name}).\nيرجى العلم أن...`);
    
    // Instead of opening 50 tabs, we generate a comma separated list they can paste in a broadcast tool,
    // or open one wa.me link if it's a small group (using api.whatsapp.com/send).
    // For B2B CRM, usually they just copy the list.
    navigator.clipboard.writeText(phones.join(","));
    alert(`تم نسخ ${phones.length} رقم هاتف إلى الحافظة (Clipboard) بنجاح!\nيمكنك لصقها في نظام إرسال الرسائل الجماعية الخاص بك.`);
  };
  
  // KPIs
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status === "مفتوح").length;
  const totalPilgrims = packages.reduce((sum, p) => sum + (p.booked || 0), 0);
  const totalSeatsAvailable = packages.filter(p => p.status === "مفتوح").reduce((sum, p) => sum + (p.capacity - (p.booked || 0)), 0);

  const filteredPackages = packages.filter(p => {
    const matchesFilter = activeFilter === "الكل" || p.status === activeFilter;
    const name = p.name || "";
    const id = p.id || "";
    const matchesSearch = name.includes(searchQuery) || id.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === "مفتوح") return "bg-green-50 text-green-700 border-green-200";
    if (status === "مكتمل") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (!isMounted) return null;

  return (
    <>
    <div className="flex min-h-screen bg-background text-gray-900 print:hidden">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Navbar />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <Moon className="text-primary" /> رحلات الحج والعمرة
            </h2>
            <p className="text-gray-500 text-sm mt-1">تسيير الأفواج، الفنادق، الطيران، وإدارة غرف المعتمرين.</p>
          </div>
          <button 
            onClick={openNewModal}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-medium"
          >
            <Plus size={20} /> تخطيط برنامج جديد
          </button>
        </div>

        {/* Umrah KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-gray-50 text-gray-600 rounded-xl"><Moon size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي البرامج</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalPackages}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4 relative overflow-hidden group">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl"><PlaneTakeoff size={24} /></div>
            <div>
              <p className="text-sm text-green-600 mb-1 font-medium">رحلات مفتوحة للتسجيل</p>
              <h3 className="text-2xl font-bold text-green-700">{activePackages}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المعتمرين المسجلين</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalPilgrims}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">مقاعد شاغرة للبيع</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalSeatsAvailable}</h3>
            </div>
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50 items-center">
            
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-max">
              {["الكل", "مفتوح", "مكتمل", "مسودة"].map(filter => (
                <button 
                  key={filter} onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-1.5 rounded-md text-sm font-medium transition ${
                    activeFilter === filter ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث باسم أو كود البرنامج..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">تفاصيل الرحلة</th>
                  <th className="px-6 py-4 font-semibold">تاريخ السفر ومدة الإقامة</th>
                  <th className="px-6 py-4 font-semibold">تسكين الفنادق (مكة/المدينة)</th>
                  <th className="px-6 py-4 font-semibold">أسعار الغرف (الرباعي)</th>
                  <th className="px-6 py-4 font-semibold text-center">الامتلاء (المانيفست)</th>
                  <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">لا توجد برامج مطابقة للبحث.</td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg, idx) => {
                    const progress = pkg.capacity > 0 ? Math.round((pkg.booked / pkg.capacity) * 100) : 0;
                    return (
                    <tr key={idx} className="hover:bg-gray-50/80 transition group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border mb-2 ${getStatusBadge(pkg.status)}`}>
                          {pkg.status}
                        </span>
                        <p className="text-sm font-bold text-gray-900">{pkg.name}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><PlaneTakeoff size={12}/> {pkg.flight}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">كود: {pkg.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays size={14} className="text-primary"/>
                          <span className="text-sm font-bold text-gray-800" dir="ltr">{pkg.departure}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400"/>
                          <span className="text-xs text-gray-500">العودة: <span dir="ltr">{pkg.returnDate}</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Building2 size={14} className="text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-800">مكة المكرمة</p>
                            <p className="text-[10px] text-gray-500">{pkg.makkahHotel}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Building2 size={14} className="text-green-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-800">المدينة المنورة</p>
                            <p className="text-[10px] text-gray-500">{pkg.madinahHotel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900" dir="ltr">{(pkg.prices?.quad || 0).toLocaleString()} د.ج</p>
                        <p className="text-[10px] text-gray-400 mt-1">ثلاثي: {(pkg.prices?.triple || 0).toLocaleString()} | ثنائي: {(pkg.prices?.double || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-gray-700">{pkg.booked} / {pkg.capacity}</span>
                          <span className="text-gray-500 font-mono">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                          <div className={`h-2 rounded-full ${progress >= 100 ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openBookingModal(pkg)} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-md transition border border-primary/20 shadow-sm" title="تسجيل معتمر">
                            + معتمر
                          </button>
                          <button onClick={() => openRemovePilgrimModal(pkg)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-md transition border border-red-100 shadow-sm" title="انسحاب معتمر (تفريغ مقعد)">
                            - إلغاء
                          </button>
                          <button onClick={() => openManifestModal(pkg)} className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-md transition border border-blue-100 shadow-sm" title="طباعة وعرض المانيفست">
                            المانيفست
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleExportExcel(pkg); }} className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-md transition border border-emerald-100 shadow-sm" title="تصدير إلى إكسل (CSV)">
                            تصدير Excel
                          </button>
                          
                          <button onClick={(e) => { e.stopPropagation(); setOperationsPkg(pkg); }} className="px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-md transition border border-purple-100 shadow-sm" title="إدارة التأشيرات وتسكين الغرف">
                            العمليات (التسكين/تأشيرات)
                          </button>
                          <button onClick={() => openEditModal(pkg)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="تعديل البرنامج">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="مسح البرنامج بالكامل">
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
        </div>
      </main>

      {/* Package Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 relative overflow-hidden h-[95vh] flex flex-col">
            <div className="bg-gray-50 border-b border-gray-100 p-6 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{selectedPackage ? "تعديل برنامج العمرة" : "تخطيط برنامج عمرة جديد"}</h2>
              <p className="text-xs text-gray-500 mt-1">قم بتحديد الطيران، الفنادق، والأسعار بدقة لطرح البرنامج للبيع.</p>
            </div>
            
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto space-y-6">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2"><Moon size={16}/> البيانات الأساسية ومشرف الرحلة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">اسم البرنامج / الرحلة</label>
                    <input 
                      required type="text" placeholder="مثال: عمرة رمضان - 15 يوم"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">حالة البرنامج</label>
                    <select 
                      className="w-full px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="مسودة">مسودة (قيد التجهيز)</option>
                      <option value="مفتوح">مفتوح للتسجيل (معروض للبيع)</option>
                      <option value="مكتمل">مكتمل (Flight Full)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">مشرف الرحلة (المرشد)</label>
                    <input 
                      type="text" placeholder="اسم المشرف"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.guideName} onChange={e => setFormData({...formData, guideName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Flights & Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2"><PlaneTakeoff size={16}/> بيانات الطيران المفصلة</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم الرحلة والناقل</label>
                    <input 
                      required type="text" placeholder="مثال: AH 1020"
                      className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                      value={formData.flight} onChange={e => setFormData({...formData, flight: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تاريخ الذهاب</label>
                      <input 
                        required type="date" 
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.departure} onChange={e => setFormData({...formData, departure: e.target.value})}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">وقت الذهاب</label>
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">مطار الإقلاع</label>
                      <input 
                        type="text" placeholder="مثال: الجزائر (ALG)"
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.departurePort} onChange={e => setFormData({...formData, departurePort: e.target.value})}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">مطار الوصول</label>
                      <input 
                        type="text" placeholder="مثال: جدة (JED)"
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.arrivalPort} onChange={e => setFormData({...formData, arrivalPort: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border-t border-dashed border-gray-200 pt-3">
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تاريخ العودة</label>
                      <input 
                        required type="date" 
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">وقت العودة</label>
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        value={formData.returnTime} onChange={e => setFormData({...formData, returnTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">السعة الكلية (المقاعد)</label>
                    <input 
                      required type="number" 
                      className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono font-bold"
                      value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Hotels */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2"><Building2 size={16}/> التسكين والفنادق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-amber-600">فندق مكة المكرمة</label>
                    <input 
                      required type="text" placeholder="اسم فندق مكة"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.makkahHotel} onChange={e => setFormData({...formData, makkahHotel: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-green-600">فندق المدينة المنورة</label>
                    <input 
                      required type="text" placeholder="اسم فندق المدينة"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.madinahHotel} onChange={e => setFormData({...formData, madinahHotel: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Pricing */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 pb-2 flex items-center gap-2">التسعير (بالدينار الجزائري DZD)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الغرفة الرباعية (Quad)</label>
                    <input 
                      required type="number" placeholder="185000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-lg"
                      value={formData.priceQuad} onChange={e => setFormData({...formData, priceQuad: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الغرفة الثلاثية (Triple)</label>
                    <input 
                      required type="number" placeholder="210000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-lg"
                      value={formData.priceTriple} onChange={e => setFormData({...formData, priceTriple: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الغرفة الثنائية (Double)</label>
                    <input 
                      required type="number" placeholder="245000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-lg"
                      value={formData.priceDouble} onChange={e => setFormData({...formData, priceDouble: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Costs */}
              <div className="space-y-4 bg-red-50 p-4 rounded-xl border border-red-100">
                <h3 className="text-sm font-bold text-red-800 pb-2 flex items-center gap-2">تكاليف الوكالة (لحساب الربح والخسارة P&L)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wider">تكلفة الطيران (للمقعد)</label>
                    <input 
                      type="number" placeholder="مثال: 95000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 font-bold"
                      value={formData.costFlight} onChange={e => setFormData({...formData, costFlight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wider">تكلفة الفنادق (للمعتمر)</label>
                    <input 
                      type="number" placeholder="مثال: 45000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 font-bold"
                      value={formData.costHotel} onChange={e => setFormData({...formData, costHotel: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wider">تكلفة التأشيرة والمسار</label>
                    <input 
                      type="number" placeholder="مثال: 25000"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 font-bold"
                      value={formData.costVisa} onChange={e => setFormData({...formData, costVisa: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-md shadow-red-500/30 flex items-center gap-2">
                  <CheckCircle size={16} /> {selectedPackage ? "حفظ تعديلات البرنامج" : "حفظ وإنشاء البرنامج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pilgrim Booking Modal */}
      {isBookingModalOpen && selectedBookingPackage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 relative overflow-hidden">
            <div className="bg-primary/5 border-b border-primary/10 p-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Users size={20}/> إضافة معتمر للبرنامج</h2>
              <p className="text-xs text-gray-500 mt-1 font-bold">البرنامج: {selectedBookingPackage.name} ({selectedBookingPackage.flight})</p>
            </div>
            
            <form onSubmit={handleSavePilgrimBooking} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">اختيار المعتمر من قاعدة العملاء (CRM)</label>
                {customers.length === 0 ? (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    لا يوجد أي عملاء مسجلين حالياً. يرجى إضافة مسافرين من قسم "إدارة العملاء" أولاً.
                  </p>
                ) : (
                  <select 
                    required
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    value={bookingData.customerId} onChange={e => setBookingData({...bookingData, customerId: e.target.value})}
                  >
                    <option value="" disabled>-- اختر العميل --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.passport || "بدون جواز"}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Family Members Selection */}
              {(() => {
                if (!bookingData.customerId) return null;
                const mainC = customers.find(c => c.id === bookingData.customerId);
                if (!mainC) return null;
                const familyId = mainC.familyId || mainC.id;
                const relatives = customers.filter(c => c.familyId === familyId && c.id !== mainC.id);
                
                if (relatives.length === 0) return null;

                return (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Users size={16} /> حجز عائلي ذكي (اختياري)
                    </h4>
                    <p className="text-xs text-amber-700 mb-3">هذا العميل مرتبط بعائلة. حدد الأفراد الذين تود حجزهم معه في نفس الرحلة ونفس الغرفة:</p>
                    <div className="space-y-2">
                      {relatives.map(rel => (
                        <label key={rel.id} className="flex items-center gap-3 bg-white p-2 rounded border border-amber-100 cursor-pointer hover:bg-amber-100 transition">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-amber-600 rounded"
                            checked={bookingData.selectedFamilyMembers.includes(rel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBookingData({...bookingData, selectedFamilyMembers: [...bookingData.selectedFamilyMembers, rel.id]});
                              } else {
                                setBookingData({...bookingData, selectedFamilyMembers: bookingData.selectedFamilyMembers.filter(id => id !== rel.id)});
                              }
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{rel.name}</p>
                            <p className="text-[10px] text-gray-500">{rel.familyRelation || 'فرد من العائلة'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-blue-700">رقم تأشيرة العمرة أو تصريح نسك (اختياري حالياً)</label>
                <input 
                  type="text" placeholder="رقم التأشيرة..."
                  className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 font-mono"
                  value={bookingData.visaNumber} onChange={e => setBookingData({...bookingData, visaNumber: e.target.value})}
                />
                <p className="text-[10px] text-gray-500 mt-1">سوف يطبع هذا الرقم في المانيفست، ويمكن تعديله لاحقاً.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تسكين المعتمر (نوع الغرفة)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['quad', 'triple', 'double'].map(type => (
                    <label key={type} className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition
                      ${bookingData.roomType === type ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}
                    `}>
                      <input 
                        type="radio" name="roomType" value={type} className="sr-only"
                        checked={bookingData.roomType === type} 
                        onChange={() => setBookingData({...bookingData, roomType: type})}
                      />
                      <span className="text-sm font-bold text-gray-800">
                        {type === 'quad' ? 'رباعية' : type === 'triple' ? 'ثلاثية' : 'ثنائية'}
                      </span>
                      <span className="text-xs text-primary font-mono mt-1">{(selectedBookingPackage.prices[type] || 0).toLocaleString()} د.ج</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={bookingData.isPaid}
                    onChange={e => setBookingData({...bookingData, isPaid: e.target.checked})}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">تم الدفع نقداً (توليد وصل مالي)</p>
                    <p className="text-xs text-gray-500">سيتم إضافة {(selectedBookingPackage.prices[bookingData.roomType] || 0).toLocaleString()} د.ج إلى حساب المداخيل.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إلغاء</button>
                <button type="submit" disabled={customers.length === 0} className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-md shadow-red-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <CheckCircle size={16} /> تأكيد وحجز المقعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Pilgrim Modal */}
      {isRemovePilgrimModalOpen && selectedPackageForRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 relative overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-red-50 border-b border-red-100 p-6 shrink-0">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2"><Trash2 size={20}/> تحديد المعتمر المنسحب</h2>
              <p className="text-xs text-red-500 mt-1 font-bold">البرنامج: {selectedPackageForRemove.name}</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {(!selectedPackageForRemove.pilgrims || selectedPackageForRemove.pilgrims.length === 0) ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">هذا البرنامج يحتوي على مقاعد محجوزة لكن بدون أسماء مسجلة (بيانات قديمة). هل تريد تفريغ مقعد عشوائي؟</p>
                  <button onClick={() => handleConfirmRemovePilgrim(null)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">تفريغ 1 مقعد</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 mb-2">قائمة المعتمرين المسجلين في هذا البرنامج:</p>
                  {selectedPackageForRemove.pilgrims.map((pilgrim: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{pilgrim.name}</p>
                        <p className="text-xs text-gray-500">غرفة: {pilgrim.roomType === 'quad' ? 'رباعية' : pilgrim.roomType === 'triple' ? 'ثلاثية' : 'ثنائية'}</p>
                      </div>
                      <button 
                        onClick={() => handleConfirmRemovePilgrim(idx)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        سحب وإلغاء حجز
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setIsRemovePilgrimModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {/* Manifest Modal */}
      {isManifestModalOpen && selectedPackageForManifest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-0 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-50 border-b border-blue-100 p-6 shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2"><Users size={20}/> إدارة التسكين وقائمة المسافرين (المانيفست)</h2>
                <p className="text-sm text-blue-600 mt-1 font-bold">البرنامج: {selectedPackageForManifest.name} | رحلة رقم: {selectedPackageForManifest.flight}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleWhatsAppBroadcast}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                  <MessageCircle size={16} /> رسالة جماعية (WhatsApp)
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                  طباعة المانيفست الرسمي
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* P&L Dashboard */}
              {(() => {
                const totalRevenue = (selectedPackageForManifest.pilgrims || []).reduce((sum: number, p: any) => sum + (selectedPackageForManifest.prices?.[p.roomType] || 0), 0);
                const pilgrimCount = (selectedPackageForManifest.pilgrims || []).length;
                const costFlight = (selectedPackageForManifest.costs?.flight || 0) * selectedPackageForManifest.capacity; // Assume paid for block of seats
                const costHotel = (selectedPackageForManifest.costs?.hotel || 0) * pilgrimCount;
                const costVisa = (selectedPackageForManifest.costs?.visa || 0) * pilgrimCount;
                const totalCost = costFlight + costHotel + costVisa;
                const netProfit = totalRevenue - totalCost;

                return (
                  <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-bold mb-1">إجمالي المداخيل (Revenue)</p>
                      <p className="text-lg font-bold text-green-600">{totalRevenue.toLocaleString()} د.ج</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-bold mb-1">التكاليف المقدرة (Costs)</p>
                      <p className="text-lg font-bold text-red-600">{totalCost.toLocaleString()} د.ج</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-bold mb-1">صافي الربح المتوقع (Net Profit)</p>
                      <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit.toLocaleString()} د.ج</p>
                    </div>
                  </div>
                );
              })()}

              {(!selectedPackageForManifest.pilgrims || selectedPackageForManifest.pilgrims.length === 0) ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">لم يتم تسجيل أي أسماء في هذا البرنامج حتى الآن.</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700">م</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700">الاسم الكامل</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700">الجنسية والميلاد</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700">الجواز</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700">التأشيرة (نسك)</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700 text-center">التسكين والحافلة</th>
                      <th className="border-b border-gray-200 p-3 text-sm font-bold text-gray-700 text-center">عقد السفر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackageForManifest.pilgrims.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border-b border-gray-100 p-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="border-b border-gray-100 p-3 text-sm font-bold text-gray-900">{p.name}</td>
                        <td className="border-b border-gray-100 p-3 text-sm text-gray-700">
                          {p.nationality || "جزائري"}<br/>
                          <span className="text-xs text-gray-400" dir="ltr">{p.dateOfBirth || "غير محدد"}</span>
                        </td>
                        <td className="border-b border-gray-100 p-3 text-sm font-mono font-bold text-gray-700">{p.passport || "بدون"}</td>
                        <td className="border-b border-gray-100 p-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <input 
                              type="text" 
                              placeholder="رقم التأشيرة" 
                              className="px-2 py-1 border border-gray-200 rounded text-xs font-mono w-32 focus:outline-primary"
                              value={p.visaNumber || ""}
                              onChange={(e) => handleUpdatePilgrimData(selectedPackageForManifest.id, idx, 'visaNumber', e.target.value)}
                            />
                            <select 
                              className={`px-2 py-1 rounded text-[10px] font-bold border ${p.visaStatus === 'جاهزة' || p.visaStatus === 'تم التسليم' ? 'bg-green-50 text-green-700 border-green-200' : p.visaStatus === 'في السفارة' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                              value={p.visaStatus || "جواز مستلم"}
                              onChange={(e) => handleUpdatePilgrimData(selectedPackageForManifest.id, idx, 'visaStatus', e.target.value)}
                            >
                              <option value="جواز مستلم">جواز مستلم</option>
                              <option value="في السفارة">في السفارة (قيد المعالجة)</option>
                              <option value="جاهزة">جاهزة (مطبوعة)</option>
                              <option value="تم التسليم">تم تسليمها للعميل</option>
                            </select>
                          </div>
                        </td>
                        <td className="border-b border-gray-100 p-3 text-sm text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-1">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold">
                                {p.roomType === 'quad' ? 'رباعية' : p.roomType === 'triple' ? 'ثلاثية' : p.roomType === 'double' ? 'ثنائية' : 'غير محدد'}
                              </span>
                              <input 
                                type="text" 
                                placeholder="غرفة" 
                                className="px-1 py-1 border border-gray-200 rounded text-[10px] font-bold text-center w-12 bg-amber-50 focus:outline-amber-500"
                                value={p.roomNumber || ""}
                                onChange={(e) => handleUpdatePilgrimData(selectedPackageForManifest.id, idx, 'roomNumber', e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">حافلة:</span>
                              <input 
                                type="text" 
                                placeholder="رقم" 
                                className="px-1 py-1 border border-gray-200 rounded text-[10px] font-bold text-center w-12 bg-blue-50 focus:outline-blue-500"
                                value={p.busNumber || ""}
                                onChange={(e) => handleUpdatePilgrimData(selectedPackageForManifest.id, idx, 'busNumber', e.target.value)}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-gray-100 p-3 text-sm text-center">
                          <button 
                            onClick={() => {
                              setSelectedPilgrimForContract({pkg: selectedPackageForManifest, pilgrim: p});
                              setTimeout(() => window.print(), 300);
                            }}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 mx-auto"
                          >
                            <FileText size={14}/> عقد السفر
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => { setIsManifestModalOpen(false); setSelectedPilgrimForContract(null); }} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
      {operationsPkg && (
        <UmrahOperationsModal pkg={operationsPkg} onClose={() => setOperationsPkg(null)} onUpdatePilgrim={handleOperationsUpdate} />
      )}

    {/* Print-Only Layouts */}
    <div className="hidden print:block w-full bg-white text-black font-sans text-sm" dir="rtl">
      
      {/* 1. Manifest Print Layout (Only if Contract is NOT selected) */}
      {selectedPackageForManifest && !selectedPilgrimForContract && (
        <div className="p-8">
          <div className="text-center mb-6 pb-4 border-b-[3px] border-black">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">MANIFEST - قائمة المسافرين الرسمية</h1>
            <h2 className="text-xl font-bold text-gray-800">{selectedPackageForManifest.name}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 border-2 border-black p-4 bg-gray-50 font-bold">
            <div>
              <p className="mb-2"><span className="text-gray-600">رقم الرحلة / الناقل:</span> {selectedPackageForManifest.flight}</p>
              <p className="mb-2"><span className="text-gray-600">تاريخ ووقت الذهاب:</span> <span dir="ltr">{selectedPackageForManifest.departure} {selectedPackageForManifest.departureTime}</span></p>
              <p className="mb-2"><span className="text-gray-600">ميناء المغادرة:</span> {selectedPackageForManifest.departurePort || "---"}</p>
              <p><span className="text-gray-600">السعة / المحجوز:</span> {selectedPackageForManifest.capacity} / {selectedPackageForManifest.booked}</p>
            </div>
            <div>
              <p className="mb-2"><span className="text-gray-600">مشرف الرحلة (PGR):</span> {selectedPackageForManifest.guideName || "غير محدد"}</p>
              <p className="mb-2"><span className="text-gray-600">تاريخ ووقت العودة:</span> <span dir="ltr">{selectedPackageForManifest.returnDate} {selectedPackageForManifest.returnTime}</span></p>
              <p className="mb-2"><span className="text-gray-600">ميناء الوصول:</span> {selectedPackageForManifest.arrivalPort || "---"}</p>
            </div>
          </div>
          
          <table className="w-full text-right border-collapse border border-black mb-8">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 w-8 text-center text-xs">م</th>
                <th className="border border-black p-2 text-sm">اسم المعتمر (Full Name)</th>
                <th className="border border-black p-2 text-sm text-center">تاريخ الميلاد (DOB)</th>
                <th className="border border-black p-2 text-sm text-center">الجنسية</th>
                <th className="border border-black p-2 text-sm text-center">جواز السفر (Passport)</th>
                <th className="border border-black p-2 text-sm text-center">رقم التأشيرة (Visa/Nusuk)</th>
                <th className="border border-black p-2 text-sm text-center">التسكين (Room)</th>
                <th className="border border-black p-2 text-sm text-center">الحافلة (Bus)</th>
              </tr>
            </thead>
            <tbody>
              {selectedPackageForManifest.pilgrims?.map((p: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-center font-bold text-xs">{idx + 1}</td>
                  <td className="border border-black p-2 font-bold">{p.name}</td>
                  <td className="border border-black p-2 text-center font-mono text-xs" dir="ltr">{p.dateOfBirth || "---"}</td>
                  <td className="border border-black p-2 text-center text-xs">{p.nationality || "جزائري"}</td>
                  <td className="border border-black p-2 text-center font-mono font-bold">{p.passport || "---"}</td>
                  <td className="border border-black p-2 text-center font-mono text-xs">{p.visaNumber || "---"}</td>
                  <td className="border border-black p-2 text-center font-bold text-xs">
                    {p.roomType === 'quad' ? 'رباعية' : p.roomType === 'triple' ? 'ثلاثية' : p.roomType === 'double' ? 'ثنائية' : 'غير محدد'}
                    {p.roomNumber && <span className="block mt-1">غرفة: {p.roomNumber}</span>}
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-xs">{p.busNumber || "---"}</td>
                </tr>
              ))}
              {(!selectedPackageForManifest.pilgrims || selectedPackageForManifest.pilgrims.length === 0) && (
                <tr>
                  <td colSpan={8} className="border border-black p-6 text-center text-gray-500 font-bold">لا توجد أسماء مسجلة في القائمة.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="flex justify-between px-16 text-md font-bold mt-16 pt-8 border-t border-gray-300">
            <div className="text-center">
              <p className="mb-8">ختم وتوقيع الوكالة السياحية</p>
              <p className="text-gray-400">.....................................</p>
            </div>
            <div className="text-center">
              <p className="mb-8">مشرف الرحلة / قائد المجموعة</p>
              <p className="text-gray-400">.....................................</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Contract Print Layout */}
      {selectedPilgrimForContract && (
        <div className="p-4 border-[6px] border-double border-gray-900 m-2 flex flex-col">
          <div className="text-center mb-4 border-b-2 border-gray-900 pb-2">
            {(() => {
              const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
              return (
                <>
                  <h1 className="text-2xl font-black mb-1">{s.agencyName || "وكالة النزلاء للسياحة والسفر"}</h1>
                  <p className="text-gray-600 font-bold text-xs">العنوان: {s.address || "---"} | الهاتف: {s.phone || "---"}</p>
                </>
              );
            })()}
            <h2 className="text-xl font-black mt-4 px-4 py-1.5 bg-gray-900 text-white inline-block uppercase tracking-widest rounded">عقد بيع رحلة سياحية (حج / عمرة)</h2>
          </div>

          <div className="mb-4">
            <p className="font-bold text-md mb-2">الطرف الأول (الوكالة): {JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}").agencyName || "وكالة النزلاء"}</p>
            <p className="font-bold text-md mb-1">الطرف الثاني (العميل/المعتمر):</p>
            <table className="w-full border-collapse border border-gray-900 mb-4 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold w-1/4">الاسم الكامل:</td>
                  <td className="border border-gray-900 p-2 font-bold text-md">{selectedPilgrimForContract.pilgrim.name}</td>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold w-1/4">رقم الجواز:</td>
                  <td className="border border-gray-900 p-2 font-bold font-mono text-md">{selectedPilgrimForContract.pilgrim.passport}</td>
                </tr>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold w-1/4">الجنسية:</td>
                  <td className="border border-gray-900 p-2 font-bold">{selectedPilgrimForContract.pilgrim.nationality || "جزائري"}</td>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold w-1/4">تاريخ الميلاد:</td>
                  <td className="border border-gray-900 p-2 font-bold font-mono">{selectedPilgrimForContract.pilgrim.dateOfBirth || "---"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-4">
            <p className="font-bold text-md mb-1">تفاصيل الرحلة والبرنامج:</p>
            <table className="w-full border-collapse border border-gray-900 mb-4 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold w-1/4">اسم البرنامج:</td>
                  <td className="border border-gray-900 p-2 font-bold" colSpan={3}>{selectedPilgrimForContract.pkg.name}</td>
                </tr>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">الخطوط الناقلة:</td>
                  <td className="border border-gray-900 p-2">{selectedPilgrimForContract.pkg.flight}</td>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">تاريخ السفر:</td>
                  <td className="border border-gray-900 p-2 font-mono" dir="ltr">{selectedPilgrimForContract.pkg.departure}</td>
                </tr>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">فندق مكة:</td>
                  <td className="border border-gray-900 p-2">{selectedPilgrimForContract.pkg.makkahHotel || "---"}</td>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">فندق المدينة:</td>
                  <td className="border border-gray-900 p-2">{selectedPilgrimForContract.pkg.madinahHotel || "---"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">نوع التسكين:</td>
                  <td className="border border-gray-900 p-2 font-bold text-md">
                    {selectedPilgrimForContract.pilgrim.roomType === 'quad' ? 'غرفة رباعية' : selectedPilgrimForContract.pilgrim.roomType === 'triple' ? 'غرفة ثلاثية' : 'غرفة ثنائية'}
                  </td>
                  <td className="border border-gray-900 p-2 bg-gray-100 font-bold">تكلفة البرنامج:</td>
                  <td className="border border-gray-900 p-2 font-black text-lg" dir="ltr">
                    {selectedPilgrimForContract.pkg.prices?.[selectedPilgrimForContract.pilgrim.roomType]?.toLocaleString()} DZD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-2">
            <p className="font-bold text-sm mb-1 text-red-700 underline">الشروط والأحكام:</p>
            <ul className="list-decimal list-inside space-y-1 text-gray-800 font-medium leading-relaxed text-xs p-2 bg-gray-50 border border-gray-200">
              <li>يقر الطرف الثاني (المعتمر) باطلاعه وموافقته على تفاصيل البرنامج وتواريخ السفر وفنادق الإقامة المذكورة أعلاه.</li>
              <li>الوكالة غير مسؤولة عن أي تغييرات طارئة من قبل خطوط الطيران (تأجيل، تقديم، أو إلغاء الرحلة).</li>
              <li>في حالة انسحاب العميل بعد إصدار التأشيرة وحجز التذكرة، يتم خصم المصاريف الفعلية المترتبة على ذلك.</li>
              <li>يلتزم المعتمر باحترام قوانين وأنظمة المملكة العربية السعودية وتوجيهات مشرف الرحلة طيلة فترة الإقامة.</li>
              <li>يعتبر هذا العقد وثيقة رسمية ملزمة للطرفين بعد التوقيع عليها.</li>
            </ul>
          </div>

          {/* Signatures at the bottom */}
          <div className="flex justify-around items-end pt-6 font-bold mt-2 mb-2">
            <div className="text-center">
              <p className="mb-6 text-sm">توقيع وبصمة الطرف الثاني (المعتمر)</p>
              <p className="text-gray-400">................................................</p>
            </div>
            <div className="text-center">
              <p className="mb-6 text-sm">ختم وتوقيع الطرف الأول (الوكالة)</p>
              <p className="text-gray-400">................................................</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}


