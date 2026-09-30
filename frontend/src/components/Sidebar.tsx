"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Plane, 
  Wallet,
  Settings 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "لوحة التحكم", icon: <LayoutDashboard size={20} />, href: "/" },
    { name: "الحجوزات", icon: <CalendarCheck size={20} />, href: "/bookings" },
    { name: "العملاء", icon: <Users size={20} />, href: "/customers" },
    { name: "الحج والعمرة", icon: <Plane size={20} />, href: "/hajj-umrah" },
    { name: "المالية", icon: <Wallet size={20} />, href: "/finance" },
    { name: "الإعدادات", icon: <Settings size={20} />, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl hidden md:flex">
      <div className="p-6 text-center border-b border-gray-700">
        <h1 className="text-3xl font-bold text-primary tracking-wide">النزلاء</h1>
        <p className="text-xs text-gray-400 mt-2 tracking-wider uppercase">نظام وكالات السفر</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-white shadow-md shadow-red-500/20" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
            م
          </div>
          <div>
            <p className="text-sm font-medium text-white">مدير النظام</p>
            <p className="text-xs text-gray-400">admin@elnouzalaa.dz</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
