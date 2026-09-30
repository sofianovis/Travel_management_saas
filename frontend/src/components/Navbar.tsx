"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Users, Plane, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{type: string, id: string, title: string, subtitle: string, url: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("النزلاء للسياحة");

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("elnouzalaa_settings") || "{}");
    if (s.agencyName) setAgencyName(s.agencyName);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const lowerVal = val.toLowerCase();
    const searchResults: typeof results = [];

    // Search Customers
    const customers = JSON.parse(localStorage.getItem("elnouzalaa_customers") || "[]");
    customers.forEach((c: any) => {
      if (c.name?.toLowerCase().includes(lowerVal) || c.phone?.includes(val) || c.passport?.toLowerCase().includes(lowerVal)) {
        searchResults.push({ type: "عميل", id: c.id, title: c.name, subtitle: c.phone || "بدون هاتف", url: `/customers` });
      }
    });

    // Search Packages/Umrah
    const packages = JSON.parse(localStorage.getItem("elnouzalaa_umrah") || "[]");
    packages.forEach((p: any) => {
      if (p.name?.toLowerCase().includes(lowerVal) || p.id?.toLowerCase().includes(lowerVal)) {
        searchResults.push({ type: "رحلة", id: p.id, title: p.name, subtitle: `انطلاق: ${p.departure}`, url: `/hajj-umrah` });
      }
      // Also search pilgrims inside packages
      p.pilgrims?.forEach((pilgrim: any) => {
        if (pilgrim.name?.toLowerCase().includes(lowerVal)) {
          searchResults.push({ type: "معتمر", id: pilgrim.id, title: pilgrim.name, subtitle: `في رحلة: ${p.name}`, url: `/hajj-umrah` });
        }
      });
    });

    // Search Finance
    const finance = JSON.parse(localStorage.getItem("elnouzalaa_finance") || "[]");
    finance.forEach((t: any) => {
      if (t.id?.toLowerCase().includes(lowerVal) || t.ref?.toLowerCase().includes(lowerVal) || t.notes?.toLowerCase().includes(lowerVal) || t.supplierName?.toLowerCase().includes(lowerVal)) {
        searchResults.push({ type: "مالية", id: t.id, title: t.notes || t.category || "حركة مالية", subtitle: `المبلغ: ${t.amount} DZD`, url: `/finance` });
      }
    });

    setResults(searchResults.slice(0, 8)); // Max 8 results
    setShowDropdown(true);
  };

  const getIcon = (type: string) => {
    if (type === "عميل" || type === "معتمر") return <Users size={16} className="text-blue-500" />;
    if (type === "رحلة") return <Plane size={16} className="text-purple-500" />;
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
            onChange={handleSearch}
            onFocus={() => { if(results.length > 0) setShowDropdown(true) }}
            placeholder="بحث شامل عن: عميل، هاتف، جواز، رحلة، رقم مالي..." 
            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white w-full transition-all font-medium"
          />
          
          {/* Dropdown Results */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
              {results.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {results.map((r, i) => (
                    <button 
                      key={i} 
                      onClick={() => { router.push(r.url); setShowDropdown(false); setQuery(""); }}
                      className="w-full text-right p-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(r.type)}
                      </div>
                      <div className="flex-1">
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
                ابحث برقم الهاتف، رقم الجواز، اسم العميل، أو مرجع الدفع
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-primary transition bg-gray-50 rounded-full hover:bg-red-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
        
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{agencyName}</p>
          <p className="text-[10px] text-primary text-right font-bold">الفرع الرئيسي</p>
        </div>
      </div>
    </header>
  );
}
