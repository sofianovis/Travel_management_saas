"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Users, Plane, CreditCard, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{type: string, id: string, title: string, subtitle: string, url: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("وكالة السياحة");
  const [user, setUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        if (parsed.role === "admin") {
          apiFetch("http://localhost:4000/settings/branches")
            .then(res => res.json())
            .then(data => setBranches(data || []));
        }
        const savedBranch = localStorage.getItem("selectedBranchId");
        if (savedBranch) setSelectedBranch(savedBranch);
      }
    }
  }, [router]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedBranch(val);
    if (val) {
      localStorage.setItem("selectedBranchId", val);
    } else {
      localStorage.removeItem("selectedBranchId");
    }
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search from Backend
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const lowerVal = query.toLowerCase();
        
        // Fetch all needed entities
        const [cRes, pRes, bRes, fRes] = await Promise.all([
          apiFetch("http://localhost:4000/customers"),
          apiFetch("http://localhost:4000/umrah"),
          apiFetch("http://localhost:4000/bookings"),
          apiFetch("http://localhost:4000/finance")
        ]);

        const customers = await cRes.json();
        const packages = await pRes.json();
        const bookings = await bRes.json();
        const finance = await fRes.json();

        const searchResults: typeof results = [];

        // Search Customers
        if (Array.isArray(customers)) {
          customers.forEach((c: any) => {
            if (c.name?.toLowerCase().includes(lowerVal) || c.phone?.includes(query) || c.passport?.toLowerCase().includes(lowerVal)) {
              searchResults.push({ type: "عميل", id: c.id, title: c.name, subtitle: c.phone || "بدون رقم", url: `/customers` });
            }
          });
        }

        // Search Umrah Packages & Pilgrims
        if (Array.isArray(packages)) {
          packages.forEach((p: any) => {
            if (p.name?.toLowerCase().includes(lowerVal) || p.id?.toLowerCase().includes(lowerVal)) {
              searchResults.push({ type: "عمرة", id: p.id, title: p.name, subtitle: `انطلاق: ${p.departure}`, url: `/hajj-umrah` });
            }
            p.pilgrims?.forEach((pilgrim: any) => {
              if (pilgrim.name?.toLowerCase().includes(lowerVal) || pilgrim.passport?.toLowerCase().includes(lowerVal)) {
                searchResults.push({ type: "معتمر", id: pilgrim.id, title: pilgrim.name, subtitle: `في رحلة: ${p.name}`, url: `/hajj-umrah` });
              }
            });
          });
        }

        // Search General Bookings
        if (Array.isArray(bookings)) {
          bookings.forEach((b: any) => {
            if (b.customerName?.toLowerCase().includes(lowerVal) || b.pnr?.toLowerCase().includes(lowerVal) || b.id?.toLowerCase().includes(lowerVal)) {
              searchResults.push({ type: "حجز", id: b.id, title: `حجز ${b.type} - ${b.customerName}`, subtitle: `PNR: ${b.pnr || 'N/A'}`, url: `/bookings` });
            }
          });
        }

        // Search Finance
        if (Array.isArray(finance)) {
          finance.forEach((t: any) => {
            if (t.id?.toLowerCase().includes(lowerVal) || t.ref?.toLowerCase().includes(lowerVal) || t.notes?.toLowerCase().includes(lowerVal)) {
              searchResults.push({ type: "معاملة", id: t.id, title: t.notes || t.category || "معاملة مالية", subtitle: `القيمة: ${t.amount} DZD`, url: `/finance` });
            }
          });
        }

        setResults(searchResults.slice(0, 10)); // Max 10 results
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  const getIcon = (type: string) => {
    if (type === "عميل" || type === "معتمر") return <Users size={16} className="text-blue-500" />;
    if (type === "عمرة") return <Plane size={16} className="text-purple-500" />;
    if (type === "حجز") return <Ticket size={16} className="text-orange-500" />;
    return <CreditCard size={16} className="text-green-500" />;
  };

  return (
    <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:hidden relative z-50">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-500 hover:text-primary">
          <Menu size={24} />
        </button>
        
        {/* Global Smart Search */}
        <div className="relative hidden md:block w-full max-w-md" ref={wrapperRef}>
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if(query.trim().length >= 2) setShowDropdown(true) }}
            placeholder="البحث الذكي: ابحث عن عميل، جواز سفر، حجز، PNR، أو معاملة مالية..." 
            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white w-full transition-all font-medium"
          />
          
          {/* Dropdown Results */}
          {showDropdown && query.trim().length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">جاري البحث في قاعدة البيانات...</div>
              ) : results.length > 0 ? (
                <div className="max-h-[350px] overflow-y-auto">
                  {results.map((r, i) => (
                    <button 
                      key={i} 
                      onClick={() => { router.push(r.url); setShowDropdown(false); setQuery(""); }}
                      className="w-full text-right p-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(r.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-900 text-sm truncate">{r.title}</p>
                        <p className="text-xs text-gray-500 truncate" dir="ltr">{r.subtitle}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded shrink-0">{r.type}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">لا توجد نتائج مطابقة لـ "{query}"</div>
              )}
              <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 font-bold border-t border-gray-100">
                البحث الذكي المتطور يبحث في كافة أقسام النظام في نفس الوقت
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === "admin" && branches.length > 0 && (
          <div className="hidden md:flex items-center ml-2">
            <select 
              value={selectedBranch}
              onChange={handleBranchChange}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-gray-700"
            >
              <option value="">كافة الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <button className="relative p-2 text-gray-400 hover:text-primary transition bg-gray-50 rounded-full hover:bg-red-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
        
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{user?.name || "تحميل..."}</p>
          <p className="text-[10px] text-primary text-right font-bold capitalize">{user?.role || "مستخدم"}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="mr-2 p-2 text-gray-400 hover:text-red-600 transition bg-gray-50 rounded-full hover:bg-red-50"
          title="تسجيل الخروج"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>
  );
}
