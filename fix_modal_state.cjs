
const fs = require("fs");
let s = fs.readFileSync("frontend/src/components/NewBookingModal.tsx", "utf8");

s = s.replace(
  "pnr: string;",
  "pnr: string;\n  cost: string;\n  notes: string;"
);

s = s.replace(
  "pnr: \"\",",
  "pnr: \"\",\n      cost: \"\",\n      notes: \"\","
);

s = s.replace(
  "pnr: initialData.pnr !== \"-\" ? initialData.pnr : \"\",",
  "pnr: initialData.pnr !== \"-\" ? initialData.pnr : \"\",\n          cost: initialData.cost ? initialData.cost.toString() : \"\",\n          notes: initialData.notes || \"\","
);

fs.writeFileSync("frontend/src/components/NewBookingModal.tsx", s, "utf8");

