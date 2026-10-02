"use client";

import { useState, useMemo } from "react";
import { X, Users, Plane, CheckCircle, Clock, XCircle, Building2, User, Search, RefreshCw, FileText } from "lucide-react";

export function UmrahOperationsModal({ 
  pkg, 
  onClose, 
  onUpdatePilgrim 
}: { 
  pkg: any, 
  onClose: () => void,
  onUpdatePilgrim: (pilgrimId: string, field: string, value: string) => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<"visas" | "rooms">("visas");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleUpdate = async (pilgrimId: string, field: string, value: string) => {
    setLoadingIds(prev => [...prev, pilgrimId]);
    try {
      await onUpdatePilgrim(pilgrimId, field, value);
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== pilgrimId));
    }
  };

  // 1. Visa Stats
  const pilgrims = pkg.pilgrims || [];
  const filteredPilgrims = pilgrims.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.passport?.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const visaStats = {
    total: pilgrims.length,
    approved: pilgrims.filter((p: any) => p.visaStatus === "تم الإصدار").length,
    pending: pilgrims.filter((p: any) => p.visaStatus === "في الانتظار" || !p.visaStatus).length,
    rejected: pilgrims.filter((p: any) => p.visaStatus === "مرفوض").length,
  };

  // 2. Rooming Logic
  // Group pilgrims by roomType and roomNumber
  const roomGroups = useMemo(() => {
    const groups: Record<string, any[]> = { quad: [], triple: [], double: [], unassigned: [] };
    
    pilgrims.forEach((p: any) => {
      const type = p.roomType || 'quad';
      const num = p.roomNumber;
      
      if (!num) {
        if (!groups.unassigned[type]) groups.unassigned[type] = [];
        groups.unassigned.push(p);
      } else {
        const key = `${type}-${num}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      }
    });
    return groups;
  }, [pilgrims]);

  const getRoomCapacity = (type: string) => {
    if (type === 'quad') return 4;
    if (type === 'triple') return 3;
    if (type === 'double') return 2;
    return 4;
  };

  const getRoomName = (type: string) => {
    if (type === 'quad') return 'رباعية';
    if (type === 'triple') return 'ثلاثية';
    if (type === 'double') return 'ثنائية';
    return type;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-primary p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Plane className="text-white/80" /> 
              إدارة العمليات: {pkg.name}
            </h2>
            <p className="text-sm text-white/70 mt-1 flex items-center gap-2">
              <Building2 size={14}/> فنادق: {pkg.makkahHotel} / {pkg.madinahHotel}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <button 
            onClick={() => setActiveTab("visas")}
            className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 transition ${activeTab === "visas" ? "bg-white text-primary border-b-2 border-primary" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <FileText size={18}/> إدارة التأشيرات
          </button>
          <button 
            onClick={() => setActiveTab("rooms")}
            className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 transition ${activeTab === "rooms" ? "bg-white text-primary border-b-2 border-primary" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Building2 size={18}/> تسكين الغرف (Rooming)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          
          {activeTab === "visas" && (
            <div className="space-y-6">
              {/* Visa Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
                  <div><p className="text-xs text-gray-500 font-bold">العدد الإجمالي</p><p className="text-2xl font-black">{visaStats.total}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24}/></div>
                  <div><p className="text-xs text-gray-500 font-bold">تم الإصدار</p><p className="text-2xl font-black text-green-600">{visaStats.approved}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24}/></div>
                  <div><p className="text-xs text-gray-500 font-bold">في الانتظار</p><p className="text-2xl font-black text-amber-600">{visaStats.pending}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl"><XCircle size={24}/></div>
                  <div><p className="text-xs text-gray-500 font-bold">مرفوض / مشكلة</p><p className="text-2xl font-black text-red-600">{visaStats.rejected}</p></div>
                </div>
              </div>

              {/* Visa List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">قائمة التأشيرات وجوازات السفر</h3>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="بحث عن معتمر أو جواز..." 
                      className="pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm focus:border-primary w-64 bg-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="p-4 border-b">المعتمر</th>
                      <th className="p-4 border-b">رقم الجواز</th>
                      <th className="p-4 border-b">حالة التأشيرة</th>
                      <th className="p-4 border-b">رقم التأشيرة</th>
                      <th className="p-4 border-b text-center">تحديث</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPilgrims.map((p: any) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <User size={14}/>
                            </div>
                            <span className="font-bold text-sm">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-gray-600">{p.passport || "---"}</td>
                        <td className="p-4">
                          <select 
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:ring-2 outline-none w-32 ${
                              p.visaStatus === 'تم الإصدار' ? 'bg-green-50 text-green-700 border-green-200' :
                              p.visaStatus === 'مرفوض' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            value={p.visaStatus || "في الانتظار"}
                            onChange={e => handleUpdate(p.id, 'visaStatus', e.target.value)}
                          >
                            <option value="في الانتظار">في الانتظار</option>
                            <option value="تم الإصدار">تم الإصدار ✔</option>
                            <option value="مرفوض">مرفوض ❌</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <input 
                            type="text" 
                            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary w-32 outline-none"
                            placeholder="رقم التأشيرة..."
                            value={p.visaNumber || ""}
                            onChange={e => handleUpdate(p.id, 'visaNumber', e.target.value)}
                          />
                        </td>
                        <td className="p-4 text-center text-gray-400">
                          {loadingIds.includes(p.id) ? <RefreshCw size={16} className="animate-spin mx-auto text-primary"/> : <CheckCircle size={16} className="mx-auto text-green-500 opacity-0"/>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-2xl flex items-center gap-3">
                <Building2 size={24} className="shrink-0"/>
                <div>
                  <h4 className="font-bold text-sm">نظام التسكين الذكي</h4>
                  <p className="text-xs opacity-80 mt-1">قم بتوزيع المعتمرين على أرقام الغرف. المعتمرون مقسمون حسب نوع الغرفة المطلوبة (رباعية، ثلاثية، ثنائية).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Unassigned Pilgrims */}
                <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="bg-gray-100 p-4 border-b border-gray-200">
                    <h3 className="font-black text-gray-800 flex items-center justify-between">
                      بدون غرفة (قيد التسكين)
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{roomGroups.unassigned.length}</span>
                    </h3>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-2 bg-gray-50">
                    {roomGroups.unassigned.length === 0 && <p className="text-center text-gray-400 text-sm py-10 font-bold">تم تسكين الجميع! 🎉</p>}
                    {roomGroups.unassigned.map((p: any) => (
                      <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 relative group">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm">{p.name}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${p.roomType === 'quad' ? 'bg-purple-100 text-purple-700' : p.roomType === 'triple' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {getRoomName(p.roomType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="أدخل رقم الغرفة..." 
                            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded focus:border-primary outline-none"
                            onKeyDown={e => {
                              if(e.key === 'Enter') handleUpdate(p.id, 'roomNumber', (e.target as HTMLInputElement).value)
                            }}
                            onBlur={e => {
                              if(e.target.value) handleUpdate(p.id, 'roomNumber', e.target.value)
                            }}
                          />
                        </div>
                        {loadingIds.includes(p.id) && <div className="absolute inset-0 bg-white/50 flex justify-center items-center rounded-xl"><RefreshCw className="animate-spin text-primary"/></div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Rooms */}
                <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="bg-primary p-4 border-b border-primary-hover text-white">
                    <h3 className="font-black flex items-center gap-2">
                      <Building2 size={18}/> الغرف المسكنة
                    </h3>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
                    {Object.keys(roomGroups).filter(k => k !== 'unassigned').length === 0 && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-20 opacity-50">
                        <Building2 size={64} className="text-gray-300 mb-4"/>
                        <p className="font-bold text-gray-500">لا توجد غرف مسكنة بعد</p>
                      </div>
                    )}
                    
                    {Object.entries(roomGroups).filter(([k]) => k !== 'unassigned').map(([roomKey, members]) => {
                      const type = roomKey.split('-')[0];
                      const num = roomKey.split('-')[1];
                      const capacity = getRoomCapacity(type);
                      const isFull = members.length >= capacity;

                      return (
                        <div key={roomKey} className={`bg-white rounded-2xl border-2 ${isFull ? 'border-green-200' : 'border-amber-200'} shadow-sm overflow-hidden flex flex-col`}>
                          <div className={`p-3 border-b flex justify-between items-center ${isFull ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'}`}>
                            <div>
                              <h4 className="font-black text-gray-800 text-lg">غرفة {num}</h4>
                              <p className="text-[10px] text-gray-500 font-bold">{getRoomName(type)}</p>
                            </div>
                            <div className={`text-xs font-black px-2 py-1 rounded-lg ${isFull ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {members.length} / {capacity} سرير
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col gap-2">
                            {members.map((m: any) => (
                              <div key={m.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100 relative">
                                <div className="flex items-center gap-2">
                                  <User size={14} className="text-gray-400"/>
                                  <span className="text-xs font-bold text-gray-700 truncate w-32">{m.name}</span>
                                </div>
                                <button 
                                  onClick={() => handleUpdate(m.id, 'roomNumber', '')}
                                  className="text-[10px] text-red-500 hover:bg-red-50 px-2 py-1 rounded font-bold transition"
                                >
                                  إزالة
                                </button>
                                {loadingIds.includes(m.id) && <div className="absolute inset-0 bg-white/80 flex justify-center items-center rounded"><RefreshCw size={14} className="animate-spin text-primary"/></div>}
                              </div>
                            ))}
                            {[...Array(Math.max(0, capacity - members.length))].map((_, i) => (
                              <div key={`empty-${i}`} className="flex items-center gap-2 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg opacity-50">
                                <User size={14} className="text-gray-300"/>
                                <span className="text-xs font-bold text-gray-400">سرير فارغ</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
