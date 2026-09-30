
const fs = require("fs");
let s = fs.readFileSync("frontend/src/components/NewBookingModal.tsx", "utf8");
const lines = s.split("\n");

const flight = decodeURIComponent("%D8%AA%D8%B0%D9%83%D8%B1%D8%A9%20%D8%B7%D9%8A%D8%B1%D8%A7%D9%86");
const flight2 = decodeURIComponent("%D8%B7%D9%8A%D8%B1%D8%A7%D9%86");
const returnDateLabel = decodeURIComponent("%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9%20(%D8%A7%D8%AE%D8%AA%D9%8A%D8%A7%D8%B1%D9%8A)");

// Replace exactly 20 lines (167 to 186 in 1-indexed)
// which corresponds to index 166 in 0-indexed array, for 20 elements.
lines.splice(166, 20, 
  "          { (formData.type === \"" + flight + "\" || formData.type === \"" + flight2 + "\") && (",
  "            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 mt-2\">",
  "              <div className=\"md:col-span-2\">",
  "                <label className=\"block text-sm font-medium text-gray-700 mb-1\">" + returnDateLabel + "</label>",
  "                <input ",
  "                  type=\"date\" ",
  "                  className=\"w-full px-4 text-gray-900 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary\"",
  "                  value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})}",
  "                />",
  "              </div>",
  "            </div>",
  "          )}"
);

s = lines.join("\n");
fs.writeFileSync("frontend/src/components/NewBookingModal.tsx", s, "utf8");

