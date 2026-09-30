const fs = require("fs");
let s = fs.readFileSync("prisma/schema.prisma", "utf8");
s = s.replace(/pilgrims\s+Pilgrim\[\]/, "pilgrims            Pilgrim[]\n  generalBookings   GeneralBooking[]");
fs.writeFileSync("prisma/schema.prisma", s, "utf8");
