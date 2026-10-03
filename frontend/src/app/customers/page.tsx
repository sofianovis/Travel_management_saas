"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Users, UserPlus, Search, Edit2, Trash2, Phone, Briefcase, Crown, User, ShieldAlert, CheckCircle, Download, History, Paperclip, Users2, Eye, Copy, X, CreditCard, FileText, Activity, PlaneTakeoff, Plus, MinusCircle, Link as LinkIcon } from "lucide-react";

export default function CustomersPage() {
  const defaultCustomers = [
    { id: "C-001", name: "أحمد بن علي", phone: "0555123456", email: "ahmed@example.com", type: "VIP", passport: "123456789", passportExpiry: "2028-10-15", nationality: "جزائري", bookings: 4 },
    { id: "C-002", name: "شركة الأفق للاستيراد", phone: "0777987654", email: "contact@alofoq.dz", type: "Corporate", passport: "-", passportExpiry: "-", nationality: "جزائري", bookings: 12 },
    { id: "C-003", name: "ياسين إبراهيم", phone: "0666112233", email: "yacine@example.com", type: "Regular", passport: "987654321", passportExpiry: "2024-01-20", nationality: "جزائري", bookings: 1 },
  ];

  const [customers, setCustomers] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile, attachments, history, family
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [familySearchQuery, setFamilySearchQuery] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("زوجة");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [newFollowUp, setNewFollowUp] = useState("");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", firstNameLatin: "", lastNameLatin: "", phone: "", whatsapp: "", email: "", type: "Regular",
    gender: "ذكر", address: "", wilaya: "", bloodType: "",
    passport: "", passportIssue: "", passportExpiry: "", 
    nationality: "جزائري", dateOfBirth: "", placeOfBirth: "", nin: "",
    mahramName: "", mahramRelation: "", healthIssues: "", notes: "",
    tags: [] as string[], passportImageName: "", personalPhotoName: "", personalPhotoData: "", passportImageData: "", followUps: [] as any[]
  });

  const [umrahPackages, setUmrahPackages] = useState<any[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);

  const fetchAllData = async () => {
    try {
      const [custRes, umrahRes, finRes] = await Promise.all([
        apiFetch("http://localhost:4000/customers", { cache: "no-store" }),
        apiFetch("http://localhost:4000/umrah", { cache: "no-store" }),
        apiFetch("http://localhost:4000/finance", { cache: "no-store" })
      ]);
      const [custList, umrahList, finList] = await Promise.all([
        custRes.json(), umrahRes.json(), finRes.json()
      ]);
      setCustomers(custList);
      setUmrahPackages(umrahList);
      setFinanceTransactions(finList);
    } catch (e) {
      console.error(e);
      setCustomers(defaultCustomers);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAllData();
  }, []);

  const openNewModal = () => {
    setSelectedCustomer(null);
    setActiveTab("profile");
    setFormData({ 
      firstName: "", lastName: "", firstNameLatin: "", lastNameLatin: "", phone: "", whatsapp: "", email: "", type: "Regular",
      gender: "ذكر", address: "", wilaya: "", bloodType: "",
      passport: "", passportIssue: "", passportExpiry: "", 
      nationality: "جزائري", dateOfBirth: "", placeOfBirth: "", nin: "",
      mahramName: "", mahramRelation: "", healthIssues: "", notes: "",
      tags: [], passportImageName: "", personalPhotoName: "", personalPhotoData: "", passportImageData: "",
      followUps: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    setActiveTab("profile");
    
    // Legacy support: extract first and last name if they were saved as a single "name" string
    const defaultFirstName = customer.firstName || (customer.name ? customer.name.split(' ')[0] : "");
    const defaultLastName = customer.lastName || (customer.name ? customer.name.split(' ').slice(1).join(' ') : "");
    const defaultFirstLatin = customer.firstNameLatin || (customer.nameLatin ? customer.nameLatin.split(' ')[0] : "");
    const defaultLastLatin = customer.lastNameLatin || (customer.nameLatin ? customer.nameLatin.split(' ').slice(1).join(' ') : "");

    setFormData({
      firstName: defaultFirstName, lastName: defaultLastName, 
      firstNameLatin: defaultFirstLatin, lastNameLatin: defaultLastLatin, 
      phone: customer.phone || "", whatsapp: customer.whatsapp || "", email: customer.email || "", type: customer.type || "Regular", 
      gender: customer.gender || "ذكر", address: customer.address || "", wilaya: customer.wilaya || "", 
      bloodType: customer.bloodType || "", passport: customer.passport || "", 
      passportIssue: customer.passportIssue || "", passportExpiry: customer.passportExpiry || "", 
      nationality: customer.nationality || "جزائري", dateOfBirth: customer.dateOfBirth || "", 
      placeOfBirth: customer.placeOfBirth || "", nin: customer.nin || "",
      mahramName: customer.mahramName || "", mahramRelation: customer.mahramRelation || "", 
      healthIssues: customer.healthIssues || "", notes: customer.notes || "",
      tags: customer.tags || [],
      passportImageName: customer.passportImageName || "",
      personalPhotoName: customer.personalPhotoName || "",
      personalPhotoData: customer.personalPhotoData || "",
      passportImageData: customer.passportImageData || "",
      followUps: customer.followUps || []
    });
    setIsModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine names to preserve legacy 'name' property used across the app
    const fullNameArabic = `${formData.firstName} ${formData.lastName}`.trim();
    const fullNameLatin = `${formData.firstNameLatin} ${formData.lastNameLatin}`.trim();

    const formattedData = {
      ...formData,
      name: fullNameArabic,
      nameLatin: fullNameLatin
    };

    try {
      if (selectedCustomer) {
        const res = await apiFetch(`http://localhost:4000/customers/${selectedCustomer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        });
        if (res.ok) fetchAllData();
      } else {
        const res = await apiFetch(`http://localhost:4000/customers`, {
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

  const linkFamilyMember = (targetCustomerId: string, relation: string = "قريب") => {
    if (!selectedCustomer) return;
    const currentFamilyId = selectedCustomer.familyId || selectedCustomer.id;
    
    setCustomers(customers.map(c => {
      if (c.id === targetCustomerId) {
        return { ...c, familyId: currentFamilyId, familyRelation: relation };
      }
      if (c.id === selectedCustomer.id && !c.familyId) {
        // Also set the current user as the head implicitly if they weren't linked before
        return { ...c, familyId: currentFamilyId, familyRelation: "رب العائلة" };
      }
      return c;
    }));
    
    // Update local selectedCustomer state to reflect changes instantly in the UI
    if (!selectedCustomer.familyId) {
      setSelectedCustomer({ ...selectedCustomer, familyId: currentFamilyId, familyRelation: "رب العائلة" });
    }
  };

  const unlinkFamilyMember = (targetCustomerId: string) => {
    setCustomers(customers.map(c => 
      c.id === targetCustomerId ? { ...c, familyId: c.id, familyRelation: "" } : c
    ));
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من مسح ملف هذا العميل؟")) {
      try {
        await apiFetch(`http://localhost:4000/customers/${id}`, { method: 'DELETE' });
        fetchAllData();
      } catch (e) {
        alert("خطأ في الاتصال");
      }
    }
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const formattedPhone = phone.startsWith('0') ? `+213${phone.substring(1)}` : phone;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Save file name
    setFormData(prev => ({ ...prev, personalPhotoName: file.name }));
    
    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, personalPhotoData: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, passportImageName: file.name }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // Larger for passport
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // slightly more compression
          setFormData(prev => ({ ...prev, passportImageData: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just save the name, clear data
      setFormData(prev => ({ ...prev, passportImageData: "" }));
    }
  };

  const exportToCSV = () => {
    const headers = ["رقم العميل", "الاسم بالعربية", "اللقب بالعربية", "الاسم باللاتينية", "اللقب باللاتينية", "رقم الجواز", "الهوية الوطنية NIN", "الهاتف", "البريد الإلكتروني", "الميلاد", "الجنسية", "الزمرة الدموية", "ملاحظات طبية"];
    
    const csvRows = customers.map(c => [
      c.id, c.firstName, c.lastName, c.firstNameLatin, c.lastNameLatin, 
      c.passport, c.nin, c.phone, c.email, c.dateOfBirth, c.nationality, c.bloodType, c.healthIssues
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Add BOM for Arabic characters support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  // KPIs
  const totalCustomers = customers.length;
  const vipCount = customers.filter(c => c.type === "VIP").length;
  const corporateCount = customers.filter(c => c.type === "Corporate").length;
  
  // Checking expired passports (dummy logic: expires within next 6 months)
  const today = new Date();
  const expiringPassports = customers.filter(c => {
    if (!c.passportExpiry || c.passportExpiry === "-") return false;
    const expDate = new Date(c.passportExpiry);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 180;
  }).length;

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = activeFilter === "الكل" || c.type === activeFilter;
    const sq = searchQuery.toLowerCase();
    
    const name = (c.name || "").toLowerCase();
    const nameLatin = (c.nameLatin || "").toLowerCase();
    const phone = c.phone || "";
    const passport = (c.passport || "").toLowerCase();
    const nin = (c.nin || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    
    const matchesSearch = 
      name.includes(sq) || 
      nameLatin.includes(sq) || 
      phone.includes(sq) || 
      passport.includes(sq) || 
      nin.includes(sq) || 
      email.includes(sq);
      
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    if (type === "VIP") return <Crown size={14} className="text-amber-500" />;
    if (type === "Corporate") return <Briefcase size={14} className="text-blue-500" />;
    return <User size={14} className="text-gray-500" />;
  };

  const getTypeBadge = (type: string) => {
    if (type === "VIP") return "bg-amber-50 text-amber-700 border-amber-200";
    if (type === "Corporate") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const currentFamilyId = selectedCustomer?.familyId || selectedCustomer?.id;
  const familyMembers = customers.filter(c => c.familyId === currentFamilyId && c.id !== selectedCustomer?.id);
  const familySearchResults = customers.filter(c => 
    c.id !== selectedCustomer?.id && 
    c.familyId !== currentFamilyId &&
    familySearchQuery.length >= 2 &&
    (
      (c.name && c.name.includes(familySearchQuery)) || 
      c.id.includes(familySearchQuery) || 
      (c.phone && c.phone.includes(familySearchQuery))
    )
  );

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-background text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Navbar />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <Users className="text-primary" /> إدارة علاقات العملاء (CRM)
            </h2>
            <p className="text-gray-500 text-sm mt-1">قاعدة بيانات المسافرين، الشركات، وجوازات السفر.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-medium text-sm"
            >
              <Download size={18} /> تصدير Excel
            </button>
            <button 
              onClick={openNewModal}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-medium"
            >
              <UserPlus size={20} /> إضافة عميل جديد
            </button>
          </div>
        </div>

        {/* CRM KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-gray-50 text-gray-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي العملاء</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalCustomers}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Crown size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">عملاء مميزين (VIP)</p>
              <h3 className="text-2xl font-bold text-gray-900">{vipCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">شركات (B2B)</p>
              <h3 className="text-2xl font-bold text-gray-900">{corporateCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4 relative overflow-hidden group">
            <div className="p-4 bg-red-50 text-red-600 rounded-xl"><ShieldAlert size={24} /></div>
            <div>
              <p className="text-sm text-red-500 mb-1 font-medium">جوازات تنتهي قريباً</p>
              <h3 className="text-2xl font-bold text-red-700">{expiringPassports}</h3>
            </div>
          </div>
        </div>

        {/* CRM Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50 items-center">
            
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-max">
              {["الكل", "Regular", "VIP", "Corporate"].map(filter => (
                <button 
                  key={filter} onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-1.5 rounded-md text-sm font-medium transition ${
                    activeFilter === filter ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {filter === "Regular" ? "أفراد" : filter === "Corporate" ? "شركات" : filter}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث بالاسم (عربي/لاتيني)، الهاتف، الجواز، الهوية، الإيميل..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم العميل</th>
                  <th className="px-6 py-4 font-semibold">العميل (عربي / لاتيني)</th>
                  <th className="px-6 py-4 font-semibold">التصنيف</th>
                  <th className="px-6 py-4 font-semibold">بيانات السفر والجواز</th>
                  <th className="px-6 py-4 font-semibold">تاريخ الميلاد والزمرة</th>
                  <th className="px-6 py-4 font-semibold">التواصل السريع</th>
                  <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا يوجد عملاء مطابقين للبحث.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition group">
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{c.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{c.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">{c.nameLatin || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getTypeBadge(c.type)}`}>
                          {getTypeIcon(c.type)} {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.type === "Corporate" ? (
                          <span className="text-xs text-gray-400">حساب شركة</span>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-gray-900 mb-0.5" title="Passport Number">P: <span className="font-mono">{c.passport || '---'}</span></p>
                            <p className="text-xs text-gray-500 mb-0.5" title="National ID">NIN: <span className="font-mono">{c.nin || '---'}</span></p>
                            <p className="text-[10px] text-red-500 font-bold uppercase">EXP: {c.passportExpiry || '-'}</p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {c.type === "Corporate" ? (
                          <span className="text-xs text-gray-400">-</span>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-gray-900 mb-0.5">{c.dateOfBirth ? <span dir="ltr">{c.dateOfBirth}</span> : '---'}</p>
                            <p className="text-xs text-gray-600 mb-0.5">{c.nationality || 'جزائري'}</p>
                            <p className="text-xs font-bold text-red-600">فصيلة الدم: <span dir="ltr" className="font-mono">{c.bloodType || '?'}</span></p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => openWhatsApp(c.phone)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-gray-100 w-max">
                          <Phone size={14} /> <span dir="ltr" className="font-mono">{c.phone}</span>
                        </button>
                        {c.email && <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[120px]">{c.email}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setViewingCustomer(c); setIsViewModalOpen(true); }} 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="عرض بطاقة العميل"
                          >
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(c)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded transition" title="تعديل الملف">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="حذف العميل">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Customer View Profile Modal */}
      {isViewModalOpen && viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 relative flex flex-col h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 shrink-0 relative">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl border-4 border-white/20 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                  {viewingCustomer.personalPhotoData ? (
                    <img src={viewingCustomer.personalPhotoData} alt="Photo" className="w-full h-full object-cover" />
                  ) : viewingCustomer.personalPhotoName ? (
                    <div className="text-center w-full bg-blue-50 h-full flex flex-col items-center justify-center p-2">
                      <User size={32} className="text-blue-400 mb-1" />
                      <span className="text-[10px] text-blue-600 font-bold leading-tight break-all">{viewingCustomer.personalPhotoName}</span>
                    </div>
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{viewingCustomer.name}</h2>
                    <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded-md">{viewingCustomer.id}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${viewingCustomer.type === 'VIP' ? 'bg-amber-500 text-white' : viewingCustomer.type === 'Corporate' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {viewingCustomer.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 font-mono tracking-widest uppercase mb-3">{viewingCustomer.nameLatin || "---"}</p>
                  
                  <div className="flex gap-2">
                    {viewingCustomer.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-white/10 text-gray-100 px-3 py-1 rounded-full border border-white/20">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              
              {/* Blacklist Warning */}
              {viewingCustomer.tags?.includes("محظور (Blacklist)") && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <ShieldAlert className="text-red-600 mt-0.5 shrink-0" size={24} />
                  <div>
                    <h3 className="text-red-900 font-bold text-sm">تنبيه أمني: عميل محظور</h3>
                    <p className="text-red-700 text-xs mt-1">هذا العميل مدرج في القائمة السوداء للوكالة. يرجى توخي الحذر أو مراجعة الإدارة قبل إجراء أي حجوزات مالية جديدة له.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Right Column: Identity & Passport */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <Briefcase size={16} className="text-primary" /> بيانات جواز السفر والهوية
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">رقم الجواز</p>
                        <div className="flex items-center gap-2 group">
                          <p className="font-mono font-bold text-lg text-gray-900">{viewingCustomer.passport || '---'}</p>
                          {viewingCustomer.passport && (
                            <button onClick={() => copyToClipboard(viewingCustomer.passport)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition" title="نسخ">
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">تاريخ الإصدار</p>
                        <p className="font-bold text-sm text-gray-800">{viewingCustomer.passportIssue || '---'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-500 mb-1 uppercase tracking-wider">تاريخ الانتهاء</p>
                        <p className="font-bold text-sm text-red-700">{viewingCustomer.passportExpiry || '---'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">الرقم الوطني (NIN)</p>
                        <div className="flex items-center gap-2 group">
                          <p className="font-mono font-bold text-sm text-gray-900">{viewingCustomer.nin || '---'}</p>
                          {viewingCustomer.nin && (
                            <button onClick={() => copyToClipboard(viewingCustomer.nin)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition" title="نسخ">
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">تاريخ الميلاد</p>
                        <p className="font-bold text-sm text-gray-800" dir="ltr">{viewingCustomer.dateOfBirth || '---'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">الجنسية</p>
                        <p className="font-bold text-sm text-gray-800">{viewingCustomer.nationality || '---'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Travel History */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <History size={16} className="text-blue-500" /> سجل رحلات العمرة
                    </h3>
                    
                    {umrahPackages.filter(pkg => pkg.pilgrims?.some((p: any) => p.id === viewingCustomer.id)).length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <PlaneTakeoff size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لم يسافر هذا العميل في أي برنامج عمرة بعد.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {umrahPackages.filter(pkg => pkg.pilgrims?.some((p: any) => p.id === viewingCustomer.id)).map((pkg, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                <PlaneTakeoff size={18} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm">{pkg.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">الرحلة: <span dir="ltr">{pkg.departureDate || pkg.departure}</span></p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">مؤكدة</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Finance Ledger */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <CreditCard size={16} className="text-green-500" /> ملخص الذمة المالية
                    </h3>
                    
                    {(() => {
                      const myTrx = financeTransactions.filter(t => 
                        t.customerId === viewingCustomer.id || 
                        (t.notes && t.notes.includes(viewingCustomer.name))
                      );
                      const totalPaid = myTrx.filter(t => t.type === 'دخل').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                      const totalRefunded = myTrx.filter(t => t.type === 'مصروف').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                      const netBalance = totalPaid - totalRefunded;

                      return (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-green-700 font-bold mb-1">المدفوعات</p>
                            <p className="text-sm font-bold text-green-900">{totalPaid.toLocaleString()} دج</p>
                          </div>
                          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-red-700 font-bold mb-1">المسترد</p>
                            <p className="text-sm font-bold text-red-900">{totalRefunded.toLocaleString()} دج</p>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-blue-700 font-bold mb-1">الرصيد</p>
                            <p className="text-sm font-bold text-blue-900">{netBalance.toLocaleString()} دج</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Family Connections */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <Users2 size={16} className="text-amber-500" /> ارتباطات العائلة والمجموعات
                    </h3>
                    
                    {(() => {
                      const vFamilyId = viewingCustomer.familyId || viewingCustomer.id;
                      const vFamilyMembers = customers.filter(c => c.familyId === vFamilyId && c.id !== viewingCustomer.id);
                      
                      return vFamilyMembers.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <Users2 size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">هذا العميل غير مرتبط بأي أفراد آخرين.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {vFamilyMembers.map(member => (
                            <div key={member.id} className="border border-gray-100 bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 relative">
                                <User size={18} />
                                {member.familyRelation && (
                                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {member.familyRelation}
                                 </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{member.familyRelation ? `صفة القرابة: ${member.familyRelation}` : member.type} • {member.phone || "بدون هاتف"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Left Column: Contact & Health & Attachments */}
                <div className="space-y-6">
                  
                  {/* Contact Info */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <Phone size={16} className="text-green-500" /> بيانات التواصل
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                        <div className="flex items-center gap-2 group">
                          <p className="font-mono font-bold text-gray-900" dir="ltr">{viewingCustomer.phone || '---'}</p>
                          {viewingCustomer.phone && (
                            <button onClick={() => openWhatsApp(viewingCustomer.phone)} className="opacity-0 group-hover:opacity-100 bg-green-100 text-green-700 p-1 rounded transition" title="واتساب">
                              <Phone size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {viewingCustomer.email && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                          <p className="font-mono text-sm text-gray-800 break-all">{viewingCustomer.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">العنوان</p>
                        <p className="text-sm text-gray-800">{viewingCustomer.address ? `${viewingCustomer.address} - ${viewingCustomer.wilaya}` : '---'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical & Mahram */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-red-500" /> الحالة الصحية والمحرم
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">فصيلة الدم</p>
                        <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{viewingCustomer.bloodType || '?'}</span>
                      </div>
                      {viewingCustomer.gender === 'أنثى' && viewingCustomer.mahramName && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">المحرم ({viewingCustomer.mahramRelation})</p>
                          <p className="font-bold text-sm text-gray-800">{viewingCustomer.mahramName}</p>
                        </div>
                      )}
                      {viewingCustomer.healthIssues && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">ملاحظات طبية</p>
                          <p className="text-sm text-gray-800 bg-orange-50 p-2 rounded-lg border border-orange-100">{viewingCustomer.healthIssues}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Followups */}
                  {viewingCustomer.followUps && viewingCustomer.followUps.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" /> أحدث الملاحظات
                      </h3>
                      <div className="space-y-3">
                        {viewingCustomer.followUps.slice(0, 3).map((note: any) => (
                          <div key={note.id} className={`p-3 rounded-xl border ${note.isDone ? 'bg-gray-50 border-gray-100' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className="flex gap-2">
                              <CheckCircle size={14} className={`mt-0.5 shrink-0 ${note.isDone ? 'text-green-500' : 'text-blue-400'}`} />
                              <div>
                                <p className={`text-xs ${note.isDone ? 'text-gray-500 line-through' : 'text-gray-800 font-bold'}`}>{note.text}</p>
                                <p className="text-[9px] text-gray-400 mt-1" dir="ltr">{new Date(note.date).toLocaleString('ar-EG')}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {viewingCustomer.followUps.length > 3 && (
                          <p className="text-center text-xs text-blue-600 font-bold pt-2 cursor-pointer hover:underline" onClick={() => { setIsViewModalOpen(false); openEditModal(viewingCustomer); setTimeout(() => setActiveTab("notes"), 100); }}>عرض كل الملاحظات ({viewingCustomer.followUps.length})</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Preview */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-500" /> المرفقات
                    </h3>
                    
                    <div className="space-y-3">
                      {viewingCustomer.passportImageData ? (
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <img src={viewingCustomer.passportImageData} alt="Passport Preview" className="w-full h-auto object-contain rounded-lg shadow-sm border border-gray-200" />
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs font-bold text-gray-800">صورة الجواز</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[120px]" dir="ltr">{viewingCustomer.passportImageName}</p>
                          </div>
                        </div>
                      ) : viewingCustomer.passportImageName ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <FileText size={24} className="text-red-400" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-800">صورة الجواز</p>
                            <p className="text-[10px] text-gray-500 truncate" dir="ltr">{viewingCustomer.passportImageName}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">لا توجد صورة جواز مرفقة</p>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 relative flex flex-col h-[90vh]">
            <div className="bg-gray-50 border-b border-gray-100 p-6 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCustomer ? "تعديل ملف العميل" : "إضافة عميل جديد"}</h2>
                  <p className="text-xs text-gray-500 mt-1">سجل تفاصيل المسافر لتسريع عمليات حجز التذاكر واستخراج التأشيرات.</p>
                </div>
                {selectedCustomer && (
                  <div className="flex gap-2">
                    {["VIP", "محظور (Blacklist)", "معتمر وفي", "عائلة"].map(tag => (
                      <button 
                        type="button" key={tag} onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          formData.tags?.includes(tag) 
                            ? (tag.includes('محظور') ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-primary text-white shadow-md shadow-primary/30') 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 border-b border-gray-200 overflow-x-auto whitespace-nowrap pb-1">
                <button type="button" onClick={() => setActiveTab("profile")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "profile" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><User size={16} className="inline mr-1" /> البيانات</button>
                <button type="button" onClick={() => setActiveTab("attachments")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "attachments" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><Paperclip size={16} className="inline mr-1" /> المرفقات</button>
                {selectedCustomer && <button type="button" onClick={() => setActiveTab("history")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><History size={16} className="inline mr-1" /> السفر</button>}
                {selectedCustomer && <button type="button" onClick={() => setActiveTab("family")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "family" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><Users2 size={16} className="inline mr-1" /> العائلة</button>}
                {selectedCustomer && <button type="button" onClick={() => setActiveTab("finance")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "finance" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><CreditCard size={16} className="inline mr-1" /> الذمة المالية</button>}
                {selectedCustomer && <button type="button" onClick={() => setActiveTab("notes")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}><Activity size={16} className="inline mr-1" /> المتابعة</button>}
              </div>
            </div>
            
            <form onSubmit={handleSaveCustomer} className="p-6 overflow-y-auto space-y-5 flex-1 relative">
              
              {/* Tab Content: Profile */}
              <div className={activeTab === "profile" ? "space-y-4 block" : "hidden"}>
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2"><UserPlus size={16}/> البيانات الشخصية والاتصال</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تصنيف العميل</label>
                    <select 
                      className="w-full px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Regular">فردي (Regular)</option>
                      <option value="VIP">مميز (VIP)</option>
                      <option value="Corporate">شركة (Corporate B2B)</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الاسم (بالعربية)</label>
                        <input 
                          required type="text" placeholder="الاسم..."
                          className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                          value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">اللقب (بالعربية)</label>
                        <input 
                          required type="text" placeholder="اللقب..."
                          className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                          value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Given Name (الاسم)</label>
                        <input 
                          type="text" dir="ltr" placeholder="FIRST NAME..."
                          className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary uppercase text-sm"
                          value={formData.firstNameLatin} onChange={e => setFormData({...formData, firstNameLatin: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Surname (اللقب)</label>
                        <input 
                          type="text" dir="ltr" placeholder="LAST NAME..."
                          className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary uppercase text-sm"
                          value={formData.lastNameLatin} onChange={e => setFormData({...formData, lastNameLatin: e.target.value.toUpperCase()})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الجنس</label>
                    <select 
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم الهاتف الأساسي</label>
                    <input 
                      required type="text" dir="ltr" placeholder="055..."
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-left"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم الواتساب / بديل</label>
                    <input 
                      type="text" dir="ltr" placeholder="066..."
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-left"
                      value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">البريد الإلكتروني</label>
                    <input 
                      type="email" dir="ltr" placeholder="email@..."
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-left"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">العنوان التفصيلي</label>
                    <input 
                      type="text" placeholder="الشارع، الحي..."
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الولاية / المدينة</label>
                    <input 
                      type="text" placeholder="الجزائر العاصمة..."
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})}
                    />
                  </div>
                </div>
              {formData.type !== "Corporate" && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2"><Briefcase size={16}/> بيانات السفر والجواز</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تاريخ الميلاد</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">مكان الميلاد</label>
                      <input 
                        type="text" placeholder="مكان الميلاد..."
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.placeOfBirth} onChange={e => setFormData({...formData, placeOfBirth: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الجنسية</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم الهوية الوطنية (NIN)</label>
                      <input 
                        type="text" dir="ltr"
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-left"
                        value={formData.nin} onChange={e => setFormData({...formData, nin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم جواز السفر</label>
                      <input 
                        type="text" dir="ltr" placeholder="P..."
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-left uppercase"
                        value={formData.passport} onChange={e => setFormData({...formData, passport: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تاريخ إصدار الجواز</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.passportIssue} onChange={e => setFormData({...formData, passportIssue: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-red-600">تاريخ انتهاء الجواز</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.passportExpiry} onChange={e => setFormData({...formData, passportExpiry: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Mahram & Health */}
              {formData.type !== "Corporate" && (
                <div className="space-y-4 pt-4 border-t border-gray-100 bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-800 pb-2 flex items-center gap-2"><UserPlus size={16}/> المحرم والحالة الصحية (للعمرة)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.gender === "أنثى" && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">اسم المحرم</label>
                          <input 
                            type="text" placeholder="الاسم الكامل للمحرم..."
                            className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.mahramName} onChange={e => setFormData({...formData, mahramName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">صلة القرابة</label>
                          <input 
                            type="text" placeholder="زوج، أب، أخ..."
                            className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.mahramRelation} onChange={e => setFormData({...formData, mahramRelation: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الزمرة الدموية</label>
                      <select 
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary dir-ltr font-mono text-center"
                        value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})}
                      >
                        <option value="">غير محدد</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">أمراض مزمنة / احتياجات طبية</label>
                      <input 
                        type="text" placeholder="سكري، ضغط، كرسي متحرك..."
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.healthIssues} onChange={e => setFormData({...formData, healthIssues: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">ملاحظات عامة</label>
                      <input 
                        type="text" placeholder="أية ملاحظات أخرى..."
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Tab Content: Attachments */}
              <div className={activeTab === "attachments" ? "space-y-6 block" : "hidden"}>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Paperclip className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">مرفقات ملف العميل</h4>
                    <p className="text-xs text-blue-700 mt-1">ارفع صورة جواز السفر والصورة الشخصية (خلفية بيضاء) لاستخدامها لاحقاً في طلب التأشيرة دون الحاجة لطلبها مجدداً.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      onChange={handlePassportUpload} 
                    />
                    {formData.passportImageData ? (
                      <div className="flex flex-col items-center">
                        <img src={formData.passportImageData} alt="Passport Preview" className="h-16 w-auto object-contain border-2 border-green-500 mb-2 rounded shadow-sm" />
                        <p className="text-sm font-bold text-gray-700">تم رفع الجواز بنجاح</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" dir="ltr">{formData.passportImageName}</p>
                      </div>
                    ) : formData.passportImageName ? (
                      <>
                        <CheckCircle className="text-green-500 mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-700">تم رفع الجواز بنجاح</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs" dir="ltr">{formData.passportImageName}</p>
                      </>
                    ) : (
                      <>
                        <Download className="text-gray-400 group-hover:text-primary transition mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-700">صورة جواز السفر الملونة</p>
                        <p className="text-xs text-gray-500 mt-1">اضغط للرفع (PDF أو JPG)</p>
                      </>
                    )}
                  </label>
                  
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png" 
                      className="hidden" 
                      onChange={handlePhotoUpload} 
                    />
                    {formData.personalPhotoData ? (
                      <div className="flex flex-col items-center">
                        <img src={formData.personalPhotoData} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mb-2" />
                        <p className="text-sm font-bold text-gray-700">تم رفع الصورة بنجاح</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" dir="ltr">{formData.personalPhotoName}</p>
                      </div>
                    ) : formData.personalPhotoName ? (
                      <>
                        <CheckCircle className="text-green-500 mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-700">تم رفع الصورة بنجاح</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs" dir="ltr">{formData.personalPhotoName}</p>
                      </>
                    ) : (
                      <>
                        <User className="text-gray-400 group-hover:text-primary transition mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-700">الصورة الشمسية (خلفية بيضاء)</p>
                        <p className="text-xs text-gray-500 mt-1">اضغط للرفع (JPG فقط)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Tab Content: History */}
              <div className={activeTab === "history" ? "block" : "hidden"}>
                {umrahPackages.filter(pkg => pkg.pilgrims?.some((p: any) => p.id === selectedCustomer?.id)).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>لا يوجد سجل حجوزات لهذا العميل حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {umrahPackages.filter(pkg => pkg.pilgrims?.some((p: any) => p.id === selectedCustomer?.id)).map((pkg, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">تاريخ الرحلة: <span dir="ltr">{pkg.departureDate || pkg.departure}</span></p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">رحلة مؤكدة</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tab Content: Finance */}
              <div className={activeTab === "finance" ? "block space-y-6" : "hidden"}>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-green-500" /> الذمة المالية والحسابات
                  </h4>
                  
                  {(() => {
                    const myTrx = financeTransactions.filter(t => 
                      t.customerId === selectedCustomer?.id || 
                      (t.notes && selectedCustomer && t.notes.includes(selectedCustomer.name))
                    );
                    const totalPaid = myTrx.filter(t => t.type === 'دخل').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                    const totalRefunded = myTrx.filter(t => t.type === 'مصروف').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                    const netBalance = totalPaid - totalRefunded;

                    if (myTrx.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                          <p>لا توجد أي حركات مالية مسجلة لهذا العميل.</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                            <p className="text-xs text-green-700 font-bold mb-1">إجمالي المدفوعات</p>
                            <p className="text-lg font-bold text-green-900">{totalPaid.toLocaleString()} دج</p>
                          </div>
                          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                            <p className="text-xs text-red-700 font-bold mb-1">إجمالي المسترد</p>
                            <p className="text-lg font-bold text-red-900">{totalRefunded.toLocaleString()} دج</p>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                            <p className="text-xs text-blue-700 font-bold mb-1">صافي الرصيد</p>
                            <p className="text-lg font-bold text-blue-900">{netBalance.toLocaleString()} دج</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-500 mb-2">سجل العمليات التفصيلي:</p>
                          {myTrx.map((trx: any) => (
                            <div key={trx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{trx.category} <span className="text-xs text-gray-500 font-normal">({trx.notes})</span></p>
                                <p className="text-[10px] text-gray-500 mt-0.5" dir="ltr">{trx.date} • {trx.method} • {trx.ref}</p>
                              </div>
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${trx.type === 'دخل' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                {trx.type === 'دخل' ? '+' : '-'}{Number(trx.amount).toLocaleString()} دج
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Tab Content: Family */}
              <div className={activeTab === "family" ? "block space-y-6" : "hidden"}>
                
                {/* Search & Add to Family */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Users2 className="text-amber-600 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">إضافة أفراد للعائلة</h4>
                      <p className="text-xs text-amber-700 mt-1">ابحث عن عميل موجود مسبقاً في النظام لربطه بعائلة هذا العميل.</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500 bg-white"
                      placeholder="ابحث بالاسم، رقم الهاتف، أو رقم العميل (اكتب حرفين على الأقل)..."
                      value={familySearchQuery}
                      onChange={(e) => setFamilySearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {familySearchQuery.length >= 2 && (
                    <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                      {familySearchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-500">لا توجد نتائج مطابقة</div>
                      ) : (
                        <ul className="divide-y divide-gray-50">
                          {familySearchResults.map(result => (
                            <li key={result.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition">
                              <div>
                                <p className="text-sm font-bold text-gray-800">{result.name}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{result.id} • {result.phone || "لا يوجد هاتف"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select 
                                  value={selectedRelation}
                                  onChange={(e) => setSelectedRelation(e.target.value)}
                                  className="text-xs border border-amber-200 bg-amber-50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                >
                                  <option value="زوجة">زوجة</option>
                                  <option value="زوج">زوج</option>
                                  <option value="ابن">ابن</option>
                                  <option value="ابنة">ابنة</option>
                                  <option value="أب">أب</option>
                                  <option value="أم">أم</option>
                                  <option value="أخ">أخ</option>
                                  <option value="أخت">أخت</option>
                                  <option value="قريب">قريب / أخرى</option>
                                </select>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    linkFamilyMember(result.id, selectedRelation);
                                    setFamilySearchQuery("");
                                  }}
                                  className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                                >
                                  <Plus size={14} /> ربط
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Family Members */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon size={16} className="text-blue-500" /> الأفراد المرتبطين بهذه العائلة ({familyMembers.length})
                  </h4>
                  
                  {familyMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users2 size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs">هذا العميل غير مرتبط بأي أفراد آخرين.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {familyMembers.map(member => (
                        <div key={member.id} className="border border-gray-100 bg-gray-50 rounded-lg p-3 flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 relative">
                              <User size={18} />
                              {member.familyRelation && (
                                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                  {member.familyRelation}
                               </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{member.name}</p>
                              <p className="text-[10px] text-gray-500">{member.familyRelation ? `صفة القرابة: ${member.familyRelation}` : member.type} • {member.phone || "بدون هاتف"}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => unlinkFamilyMember(member.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1 opacity-0 group-hover:opacity-100"
                            title="فك الارتباط"
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content: Notes */}
              <div className={activeTab === "notes" ? "block space-y-6" : "hidden"}>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> سجل المتابعة والملاحظات
                  </h4>
                  
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="أضف ملاحظة جديدة أو تذكير (مثال: اتصل به الأسبوع القادم لتأكيد الفيزا)..."
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={newFollowUp}
                      onChange={(e) => setNewFollowUp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newFollowUp.trim()) {
                          e.preventDefault();
                          setFormData(prev => ({
                            ...prev,
                            followUps: [{ id: Date.now().toString(), text: newFollowUp, date: new Date().toISOString(), isDone: false }, ...prev.followUps]
                          }));
                          setNewFollowUp("");
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newFollowUp.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            followUps: [{ id: Date.now().toString(), text: newFollowUp, date: new Date().toISOString(), isDone: false }, ...prev.followUps]
                          }));
                          setNewFollowUp("");
                        }
                      }}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.followUps?.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-4">لا توجد ملاحظات سابقة.</p>
                    ) : (
                      formData.followUps?.map((note: any) => (
                        <div key={note.id} className={`flex items-start justify-between p-3 rounded-xl border ${note.isDone ? 'bg-gray-50 border-gray-100' : 'bg-blue-50/50 border-blue-100'}`}>
                          <div className="flex items-start gap-3">
                            <button 
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  followUps: prev.followUps.map((n: any) => n.id === note.id ? { ...n, isDone: !n.isDone } : n)
                                }));
                              }}
                              className={`mt-0.5 rounded-full p-1 transition ${note.isDone ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <div>
                              <p className={`text-sm ${note.isDone ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>{note.text}</p>
                              <p className="text-[10px] text-gray-400 mt-1" dir="ltr">{new Date(note.date).toLocaleString('ar-EG')}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                followUps: prev.followUps.filter((n: any) => n.id !== note.id)
                              }));
                            }}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-md shadow-red-500/30 flex items-center gap-2">
                  <CheckCircle size={16} /> {selectedCustomer ? "حفظ التعديلات" : "إضافة العميل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


