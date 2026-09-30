const fs = require("fs");
let s = fs.readFileSync("frontend/src/app/bookings/page.tsx", "utf8");

s = s.replace(/const handleSaveBooking = \(newBooking: any\) => \{[\s\S]*?setIsModalOpen\(false\);\s*\};/, `
  const handleSaveBooking = async (booking: any) => {
    try {
      const method = booking.id && bookings.find((b: any) => b.id === booking.id) ? "PATCH" : "POST";
      const url = method === "PATCH" ? \`http://localhost:4000/bookings/\${booking.id}\` : "http://localhost:4000/bookings";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        fetchAllData();
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };
`);

s = s.replace(/const handleDelete = \(id: string\) => \{[\s\S]*?setBookings\(bookings\.filter\(b => b\.id !== id\)\);\s*\}\s*\};/, `
  const handleDelete = async (id: string) => {
    if (confirm("Â· √‰  „ √ﬂœ „‰ „”Õ Â–« «·ÕÃ“ø")) {
      try {
        await fetch(\`http://localhost:4000/bookings/\${id}\`, { method: "DELETE" });
        fetchAllData();
      } catch (e) {
        console.error(e);
      }
    }
  };
`);

fs.writeFileSync("frontend/src/app/bookings/page.tsx", s, "utf8");

