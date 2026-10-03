"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Save, Building2, Phone, MapPin, Mail, FileText, CheckCircle2, Target, Image as ImageIcon, Database, AlertTriangle, UploadCloud, DownloadCloud, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showToast, setShowToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    agencyName: "وكالة النزلاء للسياحة والسفر",
    phone: "0555 00 00 00",
    email: "contact@elnouzalaa.com",
    address: "الجزائر العاصمة، القبة",
    rcNumber: "RC-123456789",
    nifNumber: "NIF-987654321",
    monthlyTarget: "5000000",
    currency: "DZD",
    logo: ""
  });

  useEffect(() => {
    setIsMounted(true);
    apiFetch("http://localhost:4000/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          agencyName: data.agencyName || "وكالة النزلاء للسياحة والسفر",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          rcNumber: data.rc || "",
          nifNumber: data.nif || "",
          monthlyTarget: data.monthlyTarget?.toString() || "5000000",
          currency: data.currency || "DZD",
          logo: data.logoUrl || ""
        });
      })
      .catch(err => console.error("Error loading settings:", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("http://localhost:4000/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: settings.agencyName,
          phone: settings.phone,
          address: settings.address,
          rc: settings.rcNumber,
          nif: settings.nifNumber,
          monthlyTarget: parseFloat(settings.monthlyTarget),
          currency: settings.currency,
          logoUrl: settings.logo
        }),
      });
      if (res.ok) {
        showNotification("تم حفظ الإعدادات في الخادم بنجاح!");
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم");
    }
  };

  const showNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(""), 3000);
  };

  // Image Upload handler (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Backup System
  const handleExportBackup = () => {
    const data = {
      customers: JSON.parse(localStorage.getItem("elnouzalaa_customers") || "[]"),
      finance: JSON.parse(localStorage.getItem("elnouzalaa_finance") || "[]"),
      umrah: JSON.parse(localStorage.getItem("elnouzalaa_umrah") || "[]"),
      tasks: JSON.parse(localStorage.getItem("elnouzalaa_tasks") || "[]"),
      settings: JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Elnouzalaa_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification("تم استخراج النسخة الاحتياطية بنجاح.");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.customers) localStorage.setItem("elnouzalaa_customers", JSON.stringify(data.customers));
          if (data.finance) localStorage.setItem("elnouzalaa_finance", JSON.stringify(data.finance));
          if (data.umrah) localStorage.setItem("elnouzalaa_umrah", JSON.stringify(data.umrah));
          if (data.tasks) localStorage.setItem("elnouzalaa_tasks", JSON.stringify(data.tasks));
          if (data.settings) localStorage.setItem("elnouzalaa_settings", JSON.stringify(data.settings));
          
          showNotification("تم استعادة البيانات بنجاح! جاري تحديث الصفحة...");
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          alert("ملف النسخة الاحتياطية غير صالح.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFactoryReset = () => {
    if (confirm("تحذير خطير ⚠️\nهل أنت متأكد من مسح جميع بيانات الوكالة (العملاء، الرحلات، الميزانية)؟ لا يمكن التراجع عن هذه الخطوة!")) {
      const p = prompt("لتأكيد المسح، اكتب كلمة: 'مسح'");
      if (p === 'مسح') {
        localStorage.removeItem("elnouzalaa_customers");
        localStorage.removeItem("elnouzalaa_finance");
        localStorage.removeItem("elnouzalaa_umrah");
        localStorage.removeItem("elnouzalaa_tasks");
        alert("تم تفريغ النظام بنجاح. سيتم تحديث الصفحة.");
        window.location.reload();
      }
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Navbar />

        <div className="max-w-5xl mx-auto space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">الإعدادات المتقدمة (Settings)</h2>
            <p className="text-gray-500 text-sm mt-1">إدارة معلومات الوكالة، تفضيلات النظام، والنسخ الاحتياطي للبيانات.</p>
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header section with Save Button */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-primary" size={20} /> الملف التعريفي والنظام
              </h3>
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-bold text-sm">
                <Save size={18} /> حفظ الإعدادات
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="font-bold text-gray-900 border-b pb-2">المعلومات العامة والتواصل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الوكالة الرسمي</label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" value={settings.agencyName} onChange={e => setSettings({...settings, agencyName: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-bold bg-gray-50 focus:bg-white transition" required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف الأساسي</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-bold bg-gray-50 focus:bg-white transition" dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-bold bg-gray-50 focus:bg-white transition" dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الدائم</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-bold bg-gray-50 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 border-b pb-2 pt-4">المعلومات القانونية (تطبع في أسفل الوصولات)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم السجل التجاري (RC)</label>
                    <input 
                      type="text" value={settings.rcNumber} onChange={e => setSettings({...settings, rcNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-mono bg-gray-50 focus:bg-white transition" dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الرقم الجبائي (NIF)</label>
                    <input 
                      type="text" value={settings.nifNumber} onChange={e => setSettings({...settings, nifNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-mono bg-gray-50 focus:bg-white transition" dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Preferences & Logo */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 border-b pb-2">شعار الوكالة (Logo)</h4>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {settings.logo ? (
                    <img src={settings.logo} alt="Agency Logo" className="max-h-32 mx-auto object-contain mb-4 rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <p className="text-sm font-bold text-primary">انقر لرفع شعار جديد</p>
                  <p className="text-xs text-gray-400 mt-1">صيغة PNG أو JPG (شفاف أفضل)</p>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>

                <h4 className="font-bold text-gray-900 border-b pb-2 pt-4">تفضيلات وأهداف النظام</h4>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Target size={16} className="text-primary"/> الهدف المالي الشهري</label>
                  <input 
                    type="number" value={settings.monthlyTarget} onChange={e => setSettings({...settings, monthlyTarget: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-black bg-gray-50 focus:bg-white transition" dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">يُستخدم لحساب مؤشر التقدم في لوحة التحكم.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">العملة الافتراضية</label>
                  <select 
                    value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 font-bold bg-gray-50 focus:bg-white transition"
                  >
                    <option value="DZD">الدينار الجزائري (DZD)</option>
                    <option value="SAR">الريال السعودي (SAR)</option>
                    <option value="USD">الدولار الأمريكي (USD)</option>
                    <option value="EUR">اليورو (EUR)</option>
                  </select>
                </div>
              </div>
            </div>
          </form>

          {/* Backup & Danger Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Backup */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2"><Database size={20} /> النسخ الاحتياطي والاستعادة</h3>
              <p className="text-sm text-gray-500 mb-6">احمِ بياناتك بإنشاء نسخة احتياطية محلية بصيغة JSON، أو استرجعها في متصفح آخر.</p>
              
              <div className="flex flex-col gap-3">
                <button onClick={handleExportBackup} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition font-bold text-sm">
                  <DownloadCloud size={18} /> تحميل نسخة احتياطية (Export)
                </button>
                <input type="file" ref={restoreInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                <button onClick={() => restoreInputRef.current?.click()} className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition font-bold text-sm">
                  <UploadCloud size={18} /> استعادة البيانات (Import)
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 p-6">
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle size={20} /> المنطقة الخطرة (Danger Zone)</h3>
              <p className="text-sm text-red-600/80 mb-6">مسح قاعدة البيانات سيؤدي إلى حذف جميع العملاء، الحجوزات، والمالية بشكل نهائي.</p>
              
              <button onClick={handleFactoryReset} className="w-full bg-white hover:bg-red-600 hover:text-white text-red-600 border border-red-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition font-black text-sm mt-auto">
                <Trash2 size={18} /> تهيئة النظام (مسح جميع البيانات)
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-fade-in-up z-50">
          <CheckCircle2 size={24} /> {showToast}
        </div>
      )}
    </div>
  );
}
