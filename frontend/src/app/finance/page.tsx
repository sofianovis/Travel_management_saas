"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Wallet, ArrowDownToLine, ArrowUpToLine, FileText, Plus, Search, Trash2, Printer, CheckCircle, Clock, PieChart, Landmark, Download, AlertCircle } from "lucide-react";

export default function FinancePage() {
  const defaultTransactions = [
    { id: "TRX-101", type: "دخل", category: "مبيعات طيران", amount: 45000, method: "BaridiMob", date: "2023-10-25", ref: "B-1042", notes: "تذكرة الخطوط الجوية", status: "مؤكد" },
    { id: "TRX-102", type: "دخل", category: "خدمات تأشيرة", amount: 15000, method: "CIB", date: "2023-10-26", ref: "B-1044", notes: "تأشيرة دبي - سياحة", status: "مؤكد" },
    { id: "TRX-103", type: "مصروف", category: "مدفوعات للموردين", amount: 43000, method: "Bank Transfer", date: "2023-10-26", ref: "INV-88", notes: "دفع لشركة Amadeus", status: "مؤكد", supplierName: "Amadeus" },
    { id: "TRX-104", type: "مصروف", category: "مصاريف تشغيلية", amount: 12000, method: "Cash", date: "2023-10-27", ref: "-", notes: "فواتير إنترنت وكهرباء", status: "مؤكد" },
    { id: "TRX-105", type: "دخل", category: "برامج عمرة", amount: 120000, method: "Cash", date: "2023-10-28", ref: "G-UM-24", notes: "تسبيق عمرة المولد", status: "قيد المراجعة" },
  ];

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("الكل");
  
  const [formData, setFormData] = useState({
    type: "دخل",
    category: "مبيعات طيران",
    amount: "",
    method: "Cash",
    date: new Date().toISOString().split('T')[0],
    ref: "",
    notes: "",
    status: "مؤكد",
    customerId: "",
    supplierName: ""
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDebtsModalOpen, setIsDebtsModalOpen] = useState(false);

  const fetchAllData = async () => {
    try {
      const [finRes, custRes, umrahRes] = await Promise.all([
        fetch("http://localhost:4000/finance", { cache: "no-store" }),
        fetch("http://localhost:4000/customers", { cache: "no-store" }),
        fetch("http://localhost:4000/umrah", { cache: "no-store" })
      ]);
      const [finList, custList, umrahList] = await Promise.all([
        finRes.json(), custRes.json(), umrahRes.json()
      ]);
      setTransactions(finList);
      setCustomers(custList);
      setPackages(umrahList);
    } catch (e) {
      console.error(e);
      setTransactions(defaultTransactions);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAllData();
  }, []);

  const handleTypeChange = (newType: string) => {
    setFormData({
      ...formData,
      type: newType,
      category: newType === "دخل" ? "مبيعات طيران" : "مدفوعات للموردين",
      customerId: "",
      supplierName: ""
    });
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };
      
      const res = await fetch("http://localhost:4000/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });
      if (res.ok) {
        fetchAllData();
        setIsModalOpen(false);
        setFormData({ type: "دخل", category: "مبيعات طيران", amount: "", method: "Cash", date: new Date().toISOString().split('T')[0], ref: "", notes: "", status: "مؤكد", customerId: "", supplierName: "" });
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من مسح هذه الحركة المالية؟ سيؤثر هذا على الميزانية العامة.")) {
      try {
        await fetch(`http://localhost:4000/finance/${id}`, { method: 'DELETE' });
        fetchAllData();
      } catch (err) {
        alert("خطأ في الاتصال بالخادم");
      }
    }
  };

  const [selectedTrxForPrint, setSelectedTrxForPrint] = useState<any>(null);

  const handlePrint = (trx: any) => {
    setSelectedTrxForPrint(trx);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // KPIs Calculations
  const incomeTrx = transactions.filter(t => t.type === "دخل" && (t.status || "مؤكد") === "مؤكد");
  const expenseTrx = transactions.filter(t => t.type === "مصروف" && (t.status || "مؤكد") === "مؤكد");
  
  const totalIncome = incomeTrx.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpense = expenseTrx.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Breakdown by Method
  const getBalanceByMethod = (method: string) => {
    const inc = incomeTrx.filter(t => t.method === method || (method === "Bank" && (t.method === "CIB" || t.method === "Bank Transfer"))).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const exp = expenseTrx.filter(t => t.method === method || (method === "Bank" && (t.method === "CIB" || t.method === "Bank Transfer"))).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return inc - exp;
  };
  const cashBalance = getBalanceByMethod("Cash");
  const bankBalance = getBalanceByMethod("Bank");
  const baridiBalance = getBalanceByMethod("BaridiMob");

  const pendingIncome = transactions.filter(t => t.type === "دخل" && t.status === "قيد المراجعة").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesTab = activeTab === "الكل" || t.type === activeTab;
    const ref = t.ref || "";
    const notes = t.notes || "";
    const id = t.id || "";
    const category = t.category || "";
    const supplier = t.supplierName || "";
    
    const matchesSearch = ref.includes(searchQuery) || notes.includes(searchQuery) || id.includes(searchQuery) || category.includes(searchQuery) || supplier.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ["رقم الحركة", "النوع", "التصنيف", "المبلغ (د.ج)", "البنك/الخزينة", "العميل/المورد", "المرجع", "التاريخ", "ملاحظات", "الحالة"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => {
        let party = "";
        if (t.type === "دخل" && t.customerId) {
          party = customers.find(c => c.id === t.customerId)?.name || "عميل محذوف";
        } else if (t.type === "مصروف" && t.supplierName) {
          party = t.supplierName;
        }
        return `"${t.id}","${t.type}","${t.category}","${t.amount}","${t.method}","${party}","${t.ref || ''}","${t.date}","${t.notes}","${t.status}"`;
      })
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="text-primary" /> الخزينة والإدارة المالية
            </h2>
            <p className="text-gray-500 text-sm mt-1">إدارة السيولة النقدية، حسابات البنوك، ومدفوعات الموردين (B2B).</p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button 
              onClick={() => setIsDebtsModalOpen(true)}
              className="bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold"
            >
              <AlertCircle size={18} /> متابعة الديون
            </button>
            <button 
              onClick={handleExportCSV}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-medium"
            >
              <Download size={18} /> تصدير إكسيل
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-medium"
            >
              <PieChart size={18} /> تقرير الأرباح والخسائر
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-medium"
            >
              <Plus size={20} /> تسجيل عملية مالية
            </button>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <p className="text-sm text-gray-500 mb-2">إجمالي المقبوضات (المبيعات)</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalIncome.toLocaleString()} <span className="text-xs text-gray-400">د.ج</span></h3>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><ArrowDownToLine size={12}/> سيولة فعلية محصلة</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <p className="text-sm text-gray-500 mb-2">المدفوعات والمصاريف</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalExpense.toLocaleString()} <span className="text-xs text-gray-400">د.ج</span></h3>
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><ArrowUpToLine size={12}/> موردين + تشغيل</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden bg-gray-50/50">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
            <p className="text-sm text-gray-500 mb-2">شيكات / قيد المراجعة</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingIncome.toLocaleString()} <span className="text-xs text-gray-400">د.ج</span></h3>
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1"><Clock size={12}/> مبالغ غير مؤكدة بنكياً</p>
          </div>

          <div className="bg-primary text-white p-5 rounded-2xl shadow-lg shadow-red-500/10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-10"><Wallet size={120} /></div>
            <div>
              <p className="text-sm text-white/80 font-medium mb-1">الرصيد المتاح العام</p>
              <h3 className="text-3xl font-extrabold tracking-tight mb-4" dir="ltr">{netBalance.toLocaleString()} <span className="text-sm font-normal opacity-80">DZD</span></h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium border-t border-white/20 pt-3 relative z-10">
              <div>
                <span className="text-white/70 block mb-0.5">صندوق الوكالة (نقداً)</span>
                <span dir="ltr" className="font-bold">{cashBalance.toLocaleString()} DZD</span>
              </div>
              <div>
                <span className="text-white/70 block mb-0.5">البنك / بريدي موب</span>
                <span dir="ltr" className="font-bold">{(bankBalance + baridiBalance).toLocaleString()} DZD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50 items-center">
            
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-max">
              {["الكل", "دخل", "مصروف"].map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-1.5 rounded-md text-sm font-medium transition ${
                    activeTab === tab ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث برقم الحركة، التصنيف، المرجع..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم الحركة</th>
                  <th className="px-6 py-4 font-semibold">النوع والتصنيف</th>
                  <th className="px-6 py-4 font-semibold">المبلغ (د.ج)</th>
                  <th className="px-6 py-4 font-semibold">البنك / الخزينة</th>
                  <th className="px-6 py-4 font-semibold">المرجع والتفاصيل</th>
                  <th className="px-6 py-4 font-semibold">التاريخ</th>
                  <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا توجد حركات مالية مطابقة للبحث.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">{trx.id}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {trx.status === "مؤكد" ? (
                            <span className="text-[10px] text-green-600 flex items-center gap-0.5"><CheckCircle size={10}/> معتمد</span>
                          ) : (
                            <span className="text-[10px] text-orange-500 flex items-center gap-0.5"><Clock size={10}/> قيد المراجعة</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${
                          trx.type === 'دخل' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                        }`}>
                          {trx.type}
                        </span>
                        <p className="text-xs font-medium text-gray-600">{trx.category}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900" dir="ltr">
                        {trx.type === 'دخل' ? '+' : '-'}{(parseFloat(trx.amount) || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{trx.method}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{trx.ref || 'بدون مرجع'}</span>
                        {trx.customerId && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              {customers.find(c => c.id === trx.customerId)?.name || "عميل محذوف"}
                            </span>
                          </div>
                        )}
                        {trx.supplierName && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">
                              {trx.supplierName}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={trx.notes}>{trx.notes}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{trx.date}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handlePrint(trx)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="طباعة الإيصال">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => handleDelete(trx.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="حذف وإلغاء">
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


      {/* Advanced Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-0 relative overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">تسجيل عملية مالية جديدة</h2>
              <p className="text-xs text-gray-500 mt-1">تأكد من إدخال المراجع الصحيحة لتسهيل المراجعة المحاسبية.</p>
            </div>
            
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">نوع الحركة</label>
                  <select 
                    className="w-full px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                    value={formData.type} onChange={e => handleTypeChange(e.target.value)}
                  >
                    <option value="دخل">دخل (مقبوضات من العملاء)</option>
                    <option value="مصروف">مصروف (مدفوعات ومصاريف)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">التصنيف المحاسبي</label>
                  <select 
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {formData.type === "دخل" ? (
                      <>
                        <option value="مبيعات طيران">مبيعات تذاكر طيران</option>
                        <option value="مبيعات فنادق">مبيعات فنادق سياحية</option>
                        <option value="برامج عمرة">برامج الحج والعمرة</option>
                        <option value="خدمات تأشيرة">خدمات تأشيرة وتأمين</option>
                        <option value="أخرى">إيرادات أخرى</option>
                      </>
                    ) : (
                      <>
                        <option value="مدفوعات للموردين">مدفوعات للموردين (BSP, الفنادق)</option>
                        <option value="مصاريف تشغيلية">مصاريف تشغيلية (إيجار، فواتير)</option>
                        <option value="رواتب وأجور">رواتب وأجور موظفين</option>
                        <option value="تسويق وإعلانات">تسويق وإعلانات (فيسبوك، انستغرام)</option>
                        <option value="أخرى">مصاريف أخرى</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {formData.type === "دخل" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-blue-700">ربط الحركة بعميل (اختياري)</label>
                  <select 
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">-- بدون ربط (حركة عامة) --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === "مصروف" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-red-700">جهة الصرف / المورد (اختياري)</label>
                  <input 
                    type="text" placeholder="مثال: الخطوط السعودية، فندق التوحيد..."
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">المبلغ (د.ج)</label>
                  <input 
                    required type="number" 
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-lg"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">الخزينة / الحساب البنكي</label>
                  <select 
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="Cash">صندوق الوكالة (نقداً)</option>
                    <option value="CIB">البنك - بطاقة CIB</option>
                    <option value="BaridiMob">بريد الجزائر - BaridiMob</option>
                    <option value="Bank Transfer">تحويل بنكي دولي / محلي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">رقم المرجع (رقم الحجز / الفاتورة)</label>
                  <input 
                    type="text" placeholder="B-1042 أو INV-2023"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                    value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">تاريخ التنفيذ</label>
                  <input 
                    required type="date" 
                    className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">ملاحظات إضافية</label>
                <input 
                  type="text" required placeholder="بيان توضيحي للعملية..."
                  className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">حالة الاعتماد</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="مؤكد" checked={formData.status === "مؤكد"} onChange={() => setFormData({...formData, status: "مؤكد"})} className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-gray-800">مؤكد (محصل فعلياً)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="قيد المراجعة" checked={formData.status === "قيد المراجعة"} onChange={() => setFormData({...formData, status: "قيد المراجعة"})} className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-gray-800">شيك / انتظار تأكيد البنك</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-md shadow-red-500/30 flex items-center gap-2">
                  <CheckCircle size={16} /> ترحيل العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      

    </div>

    {/* Global P&L Report Modal */}
    {isReportModalOpen && (
      <div style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:static print:bg-transparent print:block">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-0 relative overflow-hidden flex flex-col max-h-[90vh] print:max-w-none print:max-h-none print:shadow-none print:overflow-visible">
          <div className="bg-primary/5 border-b border-primary/10 p-6 flex justify-between items-center shrink-0 print:bg-white print:border-b-2 print:border-gray-800 print:mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><PieChart size={24} className="text-primary print:hidden"/> تقرير الأرباح والخسائر العام لمؤسسة النزلاء</h2>
              <p className="text-sm text-gray-500 mt-1">نظرة شاملة على أرباح الوكالة من العمرة ومبيعات التذاكر.</p>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition hover:bg-gray-50 flex items-center gap-2 print:hidden">
              <Printer size={16} /> طباعة التقرير
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-6 print:overflow-visible print:p-0">
            {(() => {
              // 1. Umrah P&L
              const umrahRevenue = packages.reduce((sum, pkg) => {
                return sum + (pkg.pilgrims || []).reduce((psum: number, p: any) => psum + (pkg.prices?.[p.roomType] || 0), 0);
              }, 0);
              const umrahCost = packages.reduce((sum, pkg) => {
                const pCount = (pkg.pilgrims || []).length;
                const cFlight = (pkg.costs?.flight || 0) * pkg.capacity;
                const cHotel = (pkg.costs?.hotel || 0) * pCount;
                const cVisa = (pkg.costs?.visa || 0) * pCount;
                return sum + cFlight + cHotel + cVisa;
              }, 0);
              const umrahProfit = umrahRevenue - umrahCost;

              // 2. Tickets & Visa P&L
              const ticketsIncome = transactions.filter(t => t.type === "دخل" && (t.category === "مبيعات طيران" || t.category === "خدمات تأشيرة" || t.category === "مبيعات فنادق")).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
              const suppliersCost = transactions.filter(t => t.type === "مصروف" && t.category === "مدفوعات للموردين").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
              const ticketsProfit = ticketsIncome - suppliersCost;

              // 3. Operating Expenses
              const operatingExpenses = transactions.filter(t => t.type === "مصروف" && (t.category === "مصاريف تشغيلية" || t.category === "رواتب وأجور" || t.category === "تسويق وإعلانات" || t.category === "أخرى")).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

              // 4. Net Global Profit
              const totalGrossProfit = umrahProfit + ticketsProfit;
              const finalNetProfit = totalGrossProfit - operatingExpenses;

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Umrah Block */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <h3 className="text-sm font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">قسم الحج والعمرة</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700"><span>إجمالي المداخيل:</span> <span className="font-bold" dir="ltr">{umrahRevenue.toLocaleString()} DZD</span></div>
                        <div className="flex justify-between text-gray-700"><span>تكاليف البرامج:</span> <span className="font-bold text-red-600" dir="ltr">- {umrahCost.toLocaleString()} DZD</span></div>
                        <div className="flex justify-between text-blue-800 font-black pt-2 border-t border-blue-200 mt-2 text-lg">
                          <span>أرباح العمرة:</span> <span dir="ltr">{umrahProfit.toLocaleString()} DZD</span>
                        </div>
                      </div>
                    </div>

                    {/* Tickets Block */}
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <h3 className="text-sm font-bold text-emerald-900 mb-3 border-b border-emerald-200 pb-2">قسم التذاكر والتأشيرات</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700"><span>مبيعات (طيران/تأشيرات):</span> <span className="font-bold" dir="ltr">{ticketsIncome.toLocaleString()} DZD</span></div>
                        <div className="flex justify-between text-gray-700"><span>مدفوعات الموردين (BSP):</span> <span className="font-bold text-red-600" dir="ltr">- {suppliersCost.toLocaleString()} DZD</span></div>
                        <div className="flex justify-between text-emerald-800 font-black pt-2 border-t border-emerald-200 mt-2 text-lg">
                          <span>أرباح التذاكر:</span> <span dir="ltr">{ticketsProfit.toLocaleString()} DZD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overhead Block */}
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl max-w-md mx-auto w-full">
                    <h3 className="text-sm font-bold text-orange-900 mb-3 border-b border-orange-200 pb-2">المصاريف الإدارية والتشغيلية (Overhead)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700"><span>الرواتب، الإيجار، التسويق:</span> <span className="font-bold text-red-600" dir="ltr">- {operatingExpenses.toLocaleString()} DZD</span></div>
                    </div>
                  </div>

                  {/* Final Net Profit */}
                  <div className={`p-6 rounded-2xl border-2 text-center shadow-lg ${finalNetProfit >= 0 ? 'bg-green-600 border-green-700 shadow-green-500/20' : 'bg-red-600 border-red-700 shadow-red-500/20'}`}>
                    <p className="text-white/80 font-bold mb-1">صافي الربح العام للمؤسسة (Net Profit)</p>
                    <h2 className="text-4xl font-black text-white" dir="ltr">{finalNetProfit.toLocaleString()} <span className="text-xl font-normal opacity-80">DZD</span></h2>
                    <p className="text-white/70 text-xs mt-2">محسوب بناءً على (أرباح العمرة + أرباح التذاكر) - المصاريف الإدارية</p>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0 print:hidden">
            <button onClick={() => setIsReportModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إغلاق</button>
          </div>
        </div>
      </div>
    )}

    {/* Debts Tracking Modal */}
    {isDebtsModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 relative overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-orange-50 border-b border-orange-100 p-6 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2"><AlertCircle size={20}/> متابعة الديون والأقساط</h2>
              <p className="text-xs text-orange-700 mt-1">العملاء الذين لديهم مبالغ متبقية (ديون غير مسددة) من برامج العمرة.</p>
            </div>
          </div>
          
          <div className="p-0 overflow-y-auto">
            {(() => {
              const customerDebts = customers.map(c => {
                let totalRequired = 0;
                packages.forEach(pkg => {
                  // Find ALL pilgrims linked to this customer (themselves or family)
                  const customerPilgrims = pkg.pilgrims?.filter((p: any) => p.id === c.id || p.linkedCustomerId === c.id) || [];
                  customerPilgrims.forEach((p: any) => {
                    totalRequired += (pkg.prices?.[p.roomType] || 0);
                  });
                });
                const totalPaid = transactions.filter(t => t.customerId === c.id && t.type === "دخل").reduce((sum, t) => sum + parseFloat(t.amount), 0);
                return { ...c, totalRequired, totalPaid, debt: totalRequired - totalPaid };
              }).filter(c => c.debt > 0).sort((a, b) => b.debt - a.debt);

              return (
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-700">اسم العميل (صاحب الحجز)</th>
                      <th className="px-6 py-4 font-bold text-gray-700">الهاتف</th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-center">المطلوب سداده</th>
                      <th className="px-6 py-4 font-bold text-green-700 text-center">المدفوع</th>
                      <th className="px-6 py-4 font-bold text-red-600 text-center">الديون المتبقية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerDebts.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-bold">لا يوجد ديون مسجلة. جميع العملاء قاموا بتسديد مستحقاتهم بالكامل. 🎉</td></tr>
                    ) : (
                      customerDebts.map((c, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition">
                          <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono" dir="ltr">{c.phone || "---"}</td>
                          <td className="px-6 py-4 text-center font-bold text-gray-600" dir="ltr">{c.totalRequired.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center font-bold text-green-600" dir="ltr">{c.totalPaid.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center font-black text-red-600 bg-red-50/30" dir="ltr">{c.debt.toLocaleString()} DZD</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            })()}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
            <button onClick={() => setIsDebtsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">إغلاق</button>
          </div>
        </div>
      </div>
    )}

    {/* Receipt/Voucher Print Layout */}
    {selectedTrxForPrint && (
      <div className="hidden print:block p-8 bg-white" dir="rtl">
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            {(() => {
              const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
              if (s.logo) return <img src={s.logo} alt="Logo" className="w-20 h-20 object-contain" />;
              return null;
            })()}
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {(() => {
                  const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
                  return s.agencyName || "وكالة النزلاء للسياحة والسفر";
                })()}
              </h1>
              <p className="text-gray-600 font-medium">
                {(() => {
                  const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
                  return s.address ? `${s.address} - الهاتف: ${s.phone || ""}` : `الجزائر العاصمة - الهاتف: ${s.phone || "0555000000"}`;
                })()}
              </p>
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTrxForPrint.type === 'دخل' ? 'وصل استلام (Receipt)' : 'سند صرف (Voucher)'}</h2>
            <p className="text-gray-600 font-mono font-bold text-lg">{selectedTrxForPrint.id}</p>
            <p className="text-gray-500">{selectedTrxForPrint.date}</p>
          </div>
        </div>

        <div className="mb-10">
          <table className="w-full border-collapse">
            <tbody>
              {selectedTrxForPrint.customerId && selectedTrxForPrint.type === 'دخل' && (
                <tr>
                  <td className="py-3 font-bold text-gray-700 w-1/4">العميل / المستفيد:</td>
                  <td className="py-3 font-bold text-lg">{customers.find(c => c.id === selectedTrxForPrint.customerId)?.name || "عميل محذوف"}</td>
                </tr>
              )}
              {selectedTrxForPrint.supplierName && selectedTrxForPrint.type === 'مصروف' && (
                <tr>
                  <td className="py-3 font-bold text-gray-700 w-1/4">جهة الصرف / المورد:</td>
                  <td className="py-3 font-bold text-lg">{selectedTrxForPrint.supplierName}</td>
                </tr>
              )}
              <tr>
                <td className="py-3 border-t border-gray-200 font-bold text-gray-700 w-1/4">المبلغ (أرقام):</td>
                <td className="py-3 border-t border-gray-200 font-black text-xl" dir="ltr">{parseFloat(selectedTrxForPrint.amount).toLocaleString()} DZD</td>
              </tr>
              <tr>
                <td className="py-3 border-t border-gray-200 font-bold text-gray-700">التصنيف:</td>
                <td className="py-3 border-t border-gray-200 font-medium">{selectedTrxForPrint.category}</td>
              </tr>
              <tr>
                <td className="py-3 border-t border-gray-200 font-bold text-gray-700">طريقة الدفع:</td>
                <td className="py-3 border-t border-gray-200 font-medium">{selectedTrxForPrint.method}</td>
              </tr>
              <tr>
                <td className="py-3 border-t border-gray-200 font-bold text-gray-700">المرجع:</td>
                <td className="py-3 border-t border-gray-200 font-mono font-bold">{selectedTrxForPrint.ref || '---'}</td>
              </tr>
              <tr>
                <td className="py-3 border-t border-gray-200 font-bold text-gray-700">البيان / التفاصيل:</td>
                <td className="py-3 border-t border-gray-200 font-medium">{selectedTrxForPrint.notes}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between px-16 mt-20 text-center font-bold">
          <div>
            <p className="mb-10">توقيع المستلم / العميل</p>
            <p>.............................</p>
          </div>
          <div>
            <p className="mb-10">ختم وتوقيع الوكالة</p>
            <p>.............................</p>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 font-mono">
          {(() => {
            const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
            return s.rcNumber && s.nifNumber ? `RC: ${s.rcNumber} | NIF: ${s.nifNumber}` : "";
          })()}
        </div>
      </div>
    )}
    </>
  );
}


