"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Plane, 
  Wallet,
  Settings,
  Building2
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "لوحة التحكم", icon: <LayoutDashboard size={20} />, href: "/" },
    { name: "الحجوزات", icon: <CalendarCheck size={20} />, href: "/bookings" },
    { name: "العملاء", icon: <Users size={20} />, href: "/customers" },
    { name: "برامج العمرة", icon: <Plane size={20} />, href: "/hajj-umrah" },
    { name: "المالية", icon: <Wallet size={20} />, href: "/finance" },
    { name: "الإعدادات", icon: <Settings size={20} />, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl hidden md:flex shrink-0">
      <div className="p-5 border-b border-gray-700 flex items-center gap-3">
        {/* Logo Container (On the right in RTL) */}
        <div className="bg-white p-1.5 rounded-xl shadow-md border-2 border-primary flex items-center justify-center shrink-0 w-12 h-12 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Building2 size={24} className="text-primary hidden" />
        </div>
        
        {/* Text Container */}
        <div>
          <h1 className="text-2xl font-black text-primary tracking-wide">النزلاء</h1>
          <p className="text-[10px] text-gray-400 tracking-wider uppercase font-bold">نظام وكالات السفر</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">الدعم الفني</p>
          <p className="text-sm font-bold text-white">0555-00-00-00</p>
        </div>
      </div>
    </aside>
  );
}
