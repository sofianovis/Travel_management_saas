import { useState, useEffect } from "react";
import { X, Plane, Hotel, FileText, Car, CheckCircle } from "lucide-react";

export function NewBookingModal({ isOpen, onClose, onSave, initialData = null, customers = [] }: any) {
  const defaultForm = {
    customerId: "", customerName: "", phone: "",
    type: "طيران", destination: "", provider: "",
    date: "", returnDate: "", pnr: "",
    cost: "", amount: "", paidAmount: "", paymentStatus: "غير مدفوع", paymentMethod: "نقداً", passengers: "", attachments: "", notes: ""
  };

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>(defaultForm);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultForm);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const calculateProfit = () => {
    const cost = parseFloat(formData.cost) || 0;
    const amount = parseFloat(formData.amount) || 0;
    if (cost > 0 && amount > 0) {
      const profit = amount - cost;
      const margin = ((profit / amount) * 100).toFixed(1);
      return { profit, margin };
    }
    return null;
  };

  const getHotelNights = () => {
    if (formData.type === "فندق" && formData.date && formData.returnDate) {
      const start = new Date(formData.date);
      const end = new Date(formData.returnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? ` (مدة الإقامة: ${diffDays} ليالي)` : "";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let attachmentUrl = formData.attachments;

    try {
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        const uploadRes = await fetch('http://localhost:4000/bookings/upload', {
          method: 'POST',
          body: uploadData
        });
        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          attachmentUrl = 'http://localhost:4000' + resData.url;
        }
      }

      onSave({
        ...initialData,
        ...formData,
        paidAmount: formData.paymentStatus === 'مدفوع بالكامل' ? formData.amount : (formData.paymentStatus === 'غير مدفوع' ? 0 : formData.paidAmount),
        attachments: attachmentUrl,
        id: initialData?.id || `B-${Math.floor(Math.random() * 90000) + 10000}`,
        status: formData.pnr ? "مؤكد" : "قيد الانتظار"
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-0 relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{initialData ? "تعديل الحجز" : "إنشاء حجز جديد"}</h2>
            <p className="text-sm text-gray-500 mt-1">أدخل تفاصيل الحجز، المسافرين، والبيانات المالية</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">بيانات العميل</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اختر العميل (اختياري)</label>
                <select 
                  className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                  value={formData.customerId} 
                  onChange={(e) => {
                    const cust = customers.find((c: any) => c.id === e.target.value);
                    if (cust) {
                      setFormData({...formData, customerId: cust.id, customerName: cust.name, phone: cust.phone || ''});
                    } else {
                      setFormData({...formData, customerId: '', customerName: '', phone: ''});
                    }
                  }}
                >
                  <option value="">-- عميل جديد / اسم حر --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone || "بدون رقم"})</option>
                  ))}
                </select>
              </div>
              {!formData.customerId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المسافر (حر)</label>
                <input 
                  required={!formData.customerId} type="text" 
                  className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="الاسم واللقب"
                />
              </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (للواتساب/للتواصل)</label>
                <input 
                  type="text" 
                  className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="0555..."
                />
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">تفاصيل الحجز</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخدمة</label>
                  <select 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="طيران">طيران</option>
                    <option value="فندق">فندق</option>
                    <option value="فيزا">فيزا</option>
                    <option value="نقل">نقل / تأجير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوجهة / الفندق</label>
                  <input 
                    required type="text" 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="مثال: دبي، باريس"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الذهاب (الوصول)</label>
                  <input 
                    type="date" 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                {(formData.type === "طيران" || formData.type === "فندق") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ العودة (المغادرة)</label>
                  <input 
                    type="date" 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                  />
                </div>
                )}
              </div>
              {getHotelNights() && <div className="text-xs text-blue-600 font-medium">{getHotelNights()}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحجز (PNR)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.pnr} onChange={(e) => setFormData({...formData, pnr: e.target.value.toUpperCase()})}
                    placeholder="مثال: X7B9K"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المزود (B2B)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    placeholder="مثال: AirAlgerie, Booking"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Finance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">التفاصيل المالية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة (عليك)</label>
                  <input 
                    type="number" required min="0"
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع (للزبون)</label>
                  <input 
                    type="number" required min="0"
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-blue-600 font-bold"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {calculateProfit() && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex justify-between items-center">
                  <span className="text-sm text-green-800">الفائدة المتوقعة:</span>
                  <div className="text-left">
                    <div className="font-bold text-green-700">{calculateProfit()?.profit.toLocaleString()} د.ج</div>
                    <div className="text-xs text-green-600">هامش: %{calculateProfit()?.margin}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">حالة الدفع</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة دفع الزبون</label>
                <select 
                  className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                  value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                >
                  <option value="غير مدفوع">غير مدفوع</option>
                  <option value="مدفوع جزئياً">مدفوع جزئياً</option>
                  <option value="مدفوع بالكامل">مدفوع بالكامل</option>
                </select>
              </div>

              {formData.paymentStatus === "مدفوع جزئياً" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المسدد فعلياً (د.ج)</label>
                  <input 
                    type="number" required min="1" max={formData.amount || undefined}
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-orange-600 font-bold"
                    value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                    placeholder="أدخل المبلغ المسدد"
                  />
                </div>
              )}
              
              {formData.paymentStatus !== "غير مدفوع" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                  <select 
                    className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                    value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="نقداً">نقداً (Cash)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="بريدي موب">بريدي موب (BaridiMob)</option>
                    <option value="شيك">شيك</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Extra Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المسافرون (اختياري)</label>
              <input 
                type="text" 
                className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.passengers} onChange={(e) => setFormData({...formData, passengers: e.target.value})}
                placeholder="مثال: 3 بالغين، 1 طفل / أو أسماء المسافرين"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المرفقات (اختياري)</label>
              <input 
                type="file" 
                className="w-full px-4 text-gray-900 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                    setFormData({...formData, attachments: e.target.files[0].name});
                  }
                }}
              />
              {formData.attachments && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-green-600 truncate max-w-[200px]">الملف: {formData.attachments.split('/').pop()}</span>
                  {formData.attachments.includes('http') && (
                    <a href={formData.attachments} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      مشاهدة 📎
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
            <textarea 
              className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={2}
              value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="أضف أي ملاحظات، أو طلبات خاصة..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center shrink-0">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle size={14} className="text-green-500" /> سيتم إرسال إشعار للعميل في حالة وجود تطبيق لديه
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                إلغاء
              </button>
              <button type="submit" disabled={isUploading} className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-md shadow-red-500/20 disabled:opacity-50">
                {isUploading ? "جاري الرفع..." : (initialData ? "حفظ التعديلات" : "إصدار الحجز")}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
