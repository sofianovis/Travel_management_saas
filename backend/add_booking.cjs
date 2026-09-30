const fs = require("fs");
let s = fs.readFileSync("prisma/schema.prisma", "utf8");
s += `\n// ----------------------------------------------------
// 6. General Bookings (Flights, Hotels, Visas)
// ----------------------------------------------------
model GeneralBooking {
  id             String   @id @default(uuid())
  customerId     String?
  customer       Customer? @relation(fields: [customerId], references: [id])
  customerName   String   
  phone          String?

  type           String   
  destination    String?
  provider       String?  
  date           String?  
  returnDate     String?  
  pnr            String?

  status         String   @default("ﬁÌœ «·«‰ Ÿ«—") 
  paymentStatus  String   @default("€Ì— „œ›Ê⁄") 
  amount         Float    @default(0)

  createdAt      DateTime @default(now())
}\n`;
fs.writeFileSync("prisma/schema.prisma", s, "utf8");
