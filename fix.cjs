
const fs = require("fs");
let s = fs.readFileSync("frontend/src/app/bookings/page.tsx", "utf8");
const lines = s.split("\n");

const today = decodeURIComponent("%D8%AD%D8%AC%D9%88%D8%B2%D8%A7%D8%AA%20%D8%A7%D9%84%D9%8A%D9%88%D9%85");
const unpaid = decodeURIComponent("%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%AD%D9%82%D8%A7%D8%AA%20%D8%BA%D9%8A%D8%B1%20%D8%A7%D9%84%D9%85%D8%AF%D9%81%D9%88%D8%B9%D8%A9");
const pending = decodeURIComponent("%D8%A7%D9%84%D8%AA%D8%B0%D8%A7%D9%83%D8%B1%20%D9%82%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D9%86%D8%AA%D8%B8%D8%A7%D8%B1");
const dz = decodeURIComponent("%D8%AF.%D8%AC");

lines[238] = "              <p className=\"text-gray-500 text-sm\">" + today + "</p>";
lines[247] = "              <p className=\"text-gray-500 text-sm\">" + unpaid + "</p>";
lines[248] = "              <p className=\"text-2xl font-bold text-gray-800\">{unpaidTotal.toLocaleString()} " + dz + "</p>";
lines[256] = "              <p className=\"text-gray-500 text-sm\">" + pending + "</p>";

s = lines.join("\n");
fs.writeFileSync("frontend/src/app/bookings/page.tsx", s, "utf8");

