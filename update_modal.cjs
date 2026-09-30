
const fs = require("fs");
let s = fs.readFileSync("frontend/src/components/NewBookingModal.tsx", "utf8");

s = s.replace(/amount: "", paymentStatus:/, "amount: \"\", cost: \"\", paymentStatus:");

s = s.replace(/amount: initialData\.amount \? initialData\.amount\.toString\(\)\.replace\(\/\[\^0-9\.\]\/g, \x27\x27\) : "",/, 
`amount: initialData.amount ? initialData.amount.toString().replace(/[^0-9.]/g, "") : "",
          cost: initialData.cost ? initialData.cost.toString().replace(/[^0-9.]/g, "") : "",`);

s = s.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">/, 
`<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1"> «—ÌŒ «·–Â«»</label>
    <input 
      required type="date" 
      className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none"
      value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
    />
  </div>
  {formData.type === "ÿÌ—«‰" && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1"> «—ÌŒ «·⁄Êœ… («Œ Ì«—Ì)</label>
    <input 
      type="date" 
      className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none"
      value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
    />
  </div>
  )}
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">`);

s = s.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">\s*<div>\s*<label.*? «—ÌŒ «·”›—.*?<\/div>/s, 
`<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">”⁄— «· ﬂ·›… (œ.Ã)</label>
    <input 
      type="number" 
      className="w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none font-bold text-gray-600"
      value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})}
      placeholder="0.00"
      title="«·„»·€ «·–Ì  œ›⁄Â «·Êﬂ«·… ··„“Êœ (Ì” Œœ„ ·Õ”«» «·√—»«Õ)"
    />
  </div>`);

fs.writeFileSync("frontend/src/components/NewBookingModal.tsx", s, "utf8");

