"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Save, Building2, Phone, MapPin, Mail, Target, Image as ImageIcon, Plus, Trash2, Edit2, CheckCircle2, Map } from "lucide-react";

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showToast, setShowToast] = useState("");
  const [activeTab, setActiveTab] = useState("general"); // general, branches, users
  
  const [settings, setSettings] = useState({
    agencyName: "", phone: "", email: "", address: "", rcNumber: "", nifNumber: "", monthlyTarget: "5000000", currency: "DZD", logo: ""
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Branch Form
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ id: "", name: "", address: "", phone: "" });

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, bRes, uRes] = await Promise.all([
        apiFetch("http://localhost:4000/settings"),
        apiFetch("http://localhost:4000/settings/branches"),
        apiFetch("http://localhost:4000/settings/users")
      ]);
      const s = await sRes.json();
      const b = await bRes.json();
      const u = await uRes.json();

      if (s) {
        setSettings({
          agencyName: s.agencyName || "", phone: s.phone || "", email: s.email || "", address: s.address || "",
          rcNumber: s.rc || "", nifNumber: s.nif || "", monthlyTarget: s.monthlyTarget?.toString() || "5000000",
          currency: s.currency || "DZD", logo: s.logoUrl || ""
        });
      }
      setBranches(b || []);
      setUsers(u || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("http://localhost:4000/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: settings.agencyName, phone: settings.phone, email: settings.email, address: settings.address,
          rc: settings.rcNumber, nif: settings.nifNumber, monthlyTarget: parseFloat(settings.monthlyTarget),
          currency: settings.currency, logoUrl: settings.logo
        })
      });
      setShowToast("تم حفظ الإعدادات بنجاح");
      setTimeout(() => setShowToast(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (branchForm.id) {
        await apiFetch(`http://localhost:4000/settings/branches/${branchForm.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: branchForm.name, address: branchForm.address, phone: branchForm.phone })
        });
      } else {
        await apiFetch(`http://localhost:4000/settings/branches`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: branchForm.name, address: branchForm.address, phone: branchForm.phone })
        });
      }
      setShowBranchModal(false);
      fetchData();
      setShowToast("تم حفظ الفرع بنجاح");
      setTimeout(() => setShowToast(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الفرع؟")) {
      await apiFetch(`http://localhost:4000/settings/branches/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Navbar />

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">إعدادات المنصة</h1>
              <p className="text-gray-500">إدارة تفاصيل وكالتك، فروعك، وموظفيك في مكان واحد.</p>
            </div>
            {activeTab === 'general' && (
              <button onClick={handleSaveGeneral} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/30 transition">
                <Save size={20} /> حفظ التعديلات
              </button>
            )}
            {activeTab === 'branches' && (
              <button onClick={() => { setBranchForm({id: '', name: '', address: '', phone: ''}); setShowBranchModal(true); }} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/30 transition">
                <Plus size={20} /> إضافة فرع جديد
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-2 flex gap-2">
            <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 font-bold rounded-lg transition ${activeTab === 'general' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>الإعدادات العامة</button>
            <button onClick={() => setActiveTab('branches')} className={`flex-1 py-3 font-bold rounded-lg transition ${activeTab === 'branches' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>إدارة الفروع</button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 font-bold rounded-lg transition ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>الموظفون (قريباً)</button>
          </div>

          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="font-bold text-gray-900 border-b pb-2">المعلومات الأساسية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الوكالة</label>
                      <input type="text" value={settings.agencyName} onChange={e => setSettings({...settings, agencyName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                      <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                      <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'branches' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-sm">
                  <tr>
                    <th className="p-4">اسم الفرع</th>
                    <th className="p-4">العنوان</th>
                    <th className="p-4">رقم الهاتف</th>
                    <th className="p-4 text-center">النوع</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {branches.map(branch => (
                    <tr key={branch.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-bold text-gray-900">{branch.name}</td>
                      <td className="p-4 text-gray-600">{branch.address || '-'}</td>
                      <td className="p-4 text-gray-600" dir="ltr">{branch.phone || '-'}</td>
                      <td className="p-4 text-center">
                        {branch.isMain ? <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">الرئيسي</span> : <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">فرعي</span>}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => { setBranchForm(branch); setShowBranchModal(true); }} className="p-2 text-gray-400 hover:text-primary transition bg-white rounded-lg shadow-sm border border-gray-200"><Edit2 size={16} /></button>
                        {!branch.isMain && (
                          <button onClick={() => handleDeleteBranch(branch.id)} className="p-2 text-gray-400 hover:text-red-500 transition bg-white rounded-lg shadow-sm border border-gray-200"><Trash2 size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{branchForm.id ? "تعديل الفرع" : "إضافة فرع جديد"}</h2>
            </div>
            <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الفرع</label>
                <input required type="text" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
                <input type="text" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <input type="text" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-gray-50 focus:bg-white" dir="ltr" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowBranchModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition">حفظ الفرع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-50">
          <CheckCircle2 size={24} /> {showToast}
        </div>
      )}
    </div>
  );
}
