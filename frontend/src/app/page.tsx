"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TrendingUp, Users, Plane, CreditCard, ArrowUpRight, ArrowDownRight, Plus, Bell, Calendar, CheckCircle2, Circle, Trash2, ArrowLeft, Target, Activity, Star, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [dashboardSettings, setDashboardSettings] = useState<any>({ monthlyTarget: 5000000 });
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [packagesData, setPackagesData] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("الكل"); // الكل, هذا الشهر, هذا الأسبوع, اليوم
  
  // Tasks state
  const [tasks, setTasks] = useState<{id: number, text: string, done: boolean}[]>([
    { id: 1, text: "التواصل مع القنصلية للتأشيرات", done: false },
    { id: 2, text: "تأكيد حجز فندق التوحيد", done: true }
  ]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    setIsMounted(true);
    
    const fetchDashboardData = async () => {
      try {
        const [fRes, cRes, pRes, bRes, sRes] = await Promise.all([
          fetch("http://localhost:4000/finance", { cache: "no-store" }),
          fetch("http://localhost:4000/customers", { cache: "no-store" }),
          fetch("http://localhost:4000/umrah", { cache: "no-store" }),
          fetch("http://localhost:4000/bookings", { cache: "no-store" }),
          fetch("http://localhost:4000/settings", { cache: "no-store" })
        ]);
        
        const fData = await fRes.json();
        const cData = await cRes.json();
        const pData = await pRes.json();
        const bData = await bRes.json();
        const sData = await sRes.json();
        
        setFinanceData(fData);
        setCustomersData(cData);
        setPackagesData([...pData, ...bData]);
        
        // Save settings to local storage so the rest of the page can use it
        if(sData && sData.length > 0) {
           const finalSettings = {
             monthlyTarget: sData.find((x: any) => x.key === 'monthlyTarget')?.value || "5000000",
             agencyName: sData.find((x: any) => x.key === 'agencyName')?.value || "وكالة السياحة"
           };
           localStorage.setItem("elnouzalaa_settings", JSON.stringify(finalSettings));
           setDashboardSettings(finalSettings);
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    };
    
    fetchDashboardData();
    
    const tData = JSON.parse(localStorage.getItem("elnouzalaa_tasks") || "null");
    if (tData) setTasks(tData);
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("elnouzalaa_tasks", JSON.stringify(tasks));
  }, [tasks, isMounted]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask, done: false }, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (!isMounted) return null;

  // Date Filtering Logic
  const filterByDate = (dateString: string) => {
    if (timeFilter === "الكل") return true;
    const date = new Date(dateString);
    const today = new Date();
    if (timeFilter === "اليوم") {
      return date.toDateString() === today.toDateString();
    }
    if (timeFilter === "هذا الأسبوع") {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      return date >= firstDay;
    }
    if (timeFilter === "هذا الشهر") {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    return true;
  };

  const filteredFinance = financeData.filter(t => filterByDate(t.date));

  // 1. KPI Calculations (Filtered)
  const totalRevenue = filteredFinance.filter(t => t.type === "دخل").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalCustomers = timeFilter === "الكل" ? customersData.length : customersData.filter((c:any) => filterByDate(c.createdAt)).length;
  const totalPilgrims = timeFilter === "الكل" ? packagesData.reduce((sum, pkg) => sum + (pkg.pilgrims?.length || 0), 0) : packagesData.filter((p:any) => filterByDate(p.createdAt)).reduce((sum, pkg) => sum + (pkg.pilgrims?.length || 0), 0);
  
  // Calculate Debts (Global, not filtered by time because debts are absolute)
  const customerDebts = customersData.map(c => {
    let totalRequired = 0;
    
    // Check Hajj Packages
    packagesData.filter(pkg => pkg.pilgrims).forEach(pkg => {
      const customerPilgrims = pkg.pilgrims?.filter((p: any) => p.id === c.id || p.linkedCustomerId === c.id) || [];
      customerPilgrims.forEach((p: any) => totalRequired += (pkg.prices?.[p.roomType] || 0));
    });

    // Check General Bookings (they don't have pilgrims array, just customerId and amount)
    packagesData.filter(pkg => !pkg.pilgrims && pkg.customerId === c.id).forEach(pkg => {
      totalRequired += (Number(pkg.amount) || 0);
    });

    const totalPaid = financeData.filter(t => t.customerId === c.id && t.type === "دخل").reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { ...c, debt: totalRequired - totalPaid };
  }).filter(c => c.debt > 0).sort((a, b) => b.debt - a.debt);
  
  const totalDebt = customerDebts.reduce((sum, c) => sum + c.debt, 0);

  // VIP Customers (Top 3 by total paid)
  const vipCustomers = customersData.map(c => {
    const totalPaid = financeData.filter(t => t.customerId === c.id && t.type === "دخل").reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { ...c, totalPaid };
  }).filter(c => c.totalPaid > 0).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 3);

  // Recent Activity Timeline
  const recentActivities = [...financeData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // 2. Upcoming Flights
  const todayDateStr = new Date().toISOString().split('T')[0];
  const upcomingFlights = [...packagesData]
    .filter(p => p.departure >= todayDateStr)
    .sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime())
    .slice(0, 3);

  // 3. Analytics Chart (Last 7 Days Revenue)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dailyIncome = financeData.filter(t => t.type === "دخل" && t.date === date).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return { date: date.split('-').slice(1).join('/'), amount: dailyIncome };
  });
  const maxChartValue = Math.max(...chartData.map(d => d.amount), 10000); 

  // Monthly Sales Target (Read from settings)
  const settingsObj = dashboardSettings;
  const monthlyTarget = parseFloat(settingsObj.monthlyTarget) || 5000000;
  const currentMonthRevenue = financeData.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return t.type === "دخل" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const targetPercentage = Math.min(Math.round((currentMonthRevenue / monthlyTarget) * 100), 100);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Navbar />

        {/* Header & Quick Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">نظرة عامة (Dashboard)</h2>
            <p className="text-gray-500 text-sm mt-1">مرحباً بك مجدداً! لوحة القيادة الشاملة لأداء وكالتك.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex mr-auto xl:mr-0 shadow-sm">
              {["الكل", "هذا الشهر", "هذا الأسبوع", "اليوم"].map(f => (
                <button 
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${timeFilter === f ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            <Link href="/customers" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold text-sm">
              <Users size={16} /> عميل جديد
            </Link>
            <Link href="/finance" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 font-bold text-sm">
              <Plus size={18} /> دفعة مالية
            </Link>
          </div>
        </div>

        {/* Real-time KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden">
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-5"><TrendingUp size={100} /></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><ArrowUpRight size={14} /> إيرادات</div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1 font-medium">الإيرادات المحصلة ({timeFilter})</h3>
            <div className="text-2xl font-black text-gray-800" dir="ltr">{totalRevenue.toLocaleString()} <span className="text-xs text-gray-400 font-normal">DZD</span></div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden">
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-5"><CreditCard size={100} /></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-red-50 text-red-600 group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
              <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full"><ArrowDownRight size={14} /> ديون السوق</div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1 font-medium">إجمالي الديون المعلقة (تراكمي)</h3>
            <div className="text-2xl font-black text-gray-800" dir="ltr">{totalDebt.toLocaleString()} <span className="text-xs text-gray-400 font-normal">DZD</span></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden">
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-5"><Users size={100} /></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><Users size={24} /></div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1 font-medium">قاعدة العملاء ({timeFilter})</h3>
            <div className="text-2xl font-black text-gray-800">{totalCustomers} <span className="text-sm text-gray-400 font-normal">عميل</span></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden">
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-5"><Plane size={100} /></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform"><Plane size={24} /></div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1 font-medium">المسافرون ({timeFilter})</h3>
            <div className="text-2xl font-black text-gray-800">{totalPilgrims} <span className="text-sm text-gray-400 font-normal">حجز</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity size={20} className="text-primary"/> حركة الإيرادات (آخر 7 أيام)</h3>
                <p className="text-xs text-gray-500 mt-1">تحليل المبيعات اليومية المحصلة فعلياً.</p>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 relative pt-6 min-h-[250px]">
              {/* Y-axis lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-6 text-gray-300 pointer-events-none">
                <div className="border-b border-gray-100 w-full"></div>
                <div className="border-b border-gray-100 w-full"></div>
                <div className="border-b border-gray-100 w-full"></div>
                <div className="border-b border-gray-100 w-full"></div>
              </div>
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 z-10 group cursor-pointer h-full justify-end">
                  <div className="relative w-full max-w-[50px] flex items-end h-[90%]">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20">
                      {d.amount.toLocaleString()} DZD
                    </div>
                    <div 
                      className="w-full bg-primary/20 group-hover:bg-primary transition-all duration-500 rounded-t-xl mx-auto"
                      style={{ height: `${Math.max((d.amount / maxChartValue) * 100, 2)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 mt-3 font-mono font-bold">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals & VIP Column */}
          <div className="space-y-6">
            
            {/* Sales Target Goal */}
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10"><Target size={150} /></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10"><Target size={20}/> هدف المبيعات (هذا الشهر)</h3>
              <div className="flex items-center justify-center relative z-10 mb-2">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/20" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-white drop-shadow-md transition-all duration-1000" strokeWidth="3" strokeDasharray={`${targetPercentage}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-2xl font-black">{targetPercentage}%</div>
                </div>
              </div>
              <div className="text-center relative z-10">
                <p className="text-xs text-white/80 mb-1">المحقق: <span className="font-bold" dir="ltr">{currentMonthRevenue.toLocaleString()} DZD</span></p>
                <p className="text-xs text-white/60">الهدف: <span dir="ltr">{monthlyTarget.toLocaleString()} DZD</span></p>
              </div>
            </div>

            {/* VIP Customers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="text-yellow-500 fill-yellow-500" size={20}/> كبار العملاء (VIP)</h3>
              <div className="space-y-3">
                {vipCustomers.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-black text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500 font-mono" dir="ltr">{c.phone || "---"}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-green-600 text-sm" dir="ltr">{c.totalPaid.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">إجمالي المدفوعات</p>
                    </div>
                  </div>
                ))}
                {vipCustomers.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">لا توجد بيانات مالية كافية.</div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock className="text-blue-500" size={20}/> أحدث النشاطات</h3>
            <div className="relative border-r-2 border-gray-100 pr-4 space-y-6">
              {recentActivities.map((act, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -right-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${act.type === 'دخل' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-sm font-bold text-gray-800">
                    {act.type === 'دخل' ? 'استلام دفعة مالية' : 'تسجيل مصروف'} 
                    <span className={`mx-2 px-2 py-0.5 rounded text-[10px] ${act.type === 'دخل' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} dir="ltr">{act.amount.toLocaleString()} DZD</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{act.notes || act.category}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">{act.date} | {act.id}</p>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">لا توجد نشاطات مسجلة بعد.</div>
              )}
            </div>
            {recentActivities.length > 0 && (
              <Link href="/finance" className="block w-full text-center mt-6 text-sm text-primary font-bold hover:underline">عرض كل السجل</Link>
            )}
          </div>

          {/* Smart Alerts: Debts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard className="text-red-500" size={20}/> أبرز الديون المستحقة</h3>
            </div>
            <div className="space-y-3 flex-1">
              {customerDebts.slice(0, 4).map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-gray-50">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500 font-mono" dir="ltr">{c.phone || "بدون هاتف"}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-red-600" dir="ltr">{c.debt.toLocaleString()} DZD</p>
                    <p className="text-[10px] text-gray-400">متبقي للدفع</p>
                  </div>
                </div>
              ))}
              {customerDebts.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">لا توجد أي ديون مستحقة حالياً. 👏</div>
              )}
            </div>
            <Link href="/finance" className="block w-full text-center mt-4 text-sm text-primary font-bold hover:underline">إدارة الديون</Link>
          </div>

          {/* Right Column: Upcoming Flights & Todos */}
          <div className="space-y-6">
            
            {/* Upcoming Flights Alert */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Bell className="text-yellow-400" size={20}/> الرحلات القادمة</h3>
              <div className="space-y-3">
                {upcomingFlights.length > 0 ? upcomingFlights.map((p, i) => (
                  <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/5 hover:bg-white/20 transition">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-white truncate max-w-[150px]">{p.name}</p>
                      <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold shrink-0">{p.capacity} مقعد</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70 font-mono">
                      <Calendar size={12} /> {p.departure}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-white/50 text-sm">لا توجد رحلات مبرمجة قريباً.</div>
                )}
              </div>
            </div>

            {/* To-Do List Widget */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle2 className="text-blue-500" size={18}/> مهام سريعة</h3>
              <div className="max-h-[120px] overflow-y-auto space-y-1 mb-3 custom-scrollbar pr-1">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg group transition">
                    <button onClick={() => toggleTask(task.id)} className="text-gray-400 hover:text-primary transition shrink-0">
                      {task.done ? <CheckCircle2 className="text-green-500" size={16} /> : <Circle size={16} />}
                    </button>
                    <p className={`text-xs flex-1 transition ${task.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                      {task.text}
                    </p>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={addTask} className="relative">
                <input 
                  type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="أضف مهمة..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary pr-10"
                />
                <button type="submit" className="absolute left-1 top-1/2 -translate-y-1/2 bg-primary text-white p-1 rounded hover:bg-primary-hover transition">
                  <Plus size={14} />
                </button>
              </form>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
