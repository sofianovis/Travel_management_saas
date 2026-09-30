
const fs = require("fs");
let s = fs.readFileSync("frontend/src/components/NewBookingModal.tsx", "utf8");

const getLabelsLogic = `
  const getProviderLabel = () => {
    if (formData.type === "ÊÐßÑÉ ØíÑÇä" || formData.type === "ØíÑÇä") return "ÔÑßÉ ÇáØíÑÇä";
    if (formData.type === "ÝäÏÞ") return "ÇÓã ÇáÝäÏÞ";
    if (formData.type === "ÊÃÔíÑÉ") return "äæÚ ÇáÊÃÔíÑÉ / ÇáÓÝÇÑÉ";
    return "ÇáãÒæÏ / ÇáÔÑßÉ";
  };
  
  const getDestinationLabel = () => {
    if (formData.type === "ÊÐßÑÉ ØíÑÇä" || formData.type === "ØíÑÇä") return "ÇáæÌåÉ / ÇáãÓÇÑ";
    if (formData.type === "ÝäÏÞ") return "äæÚ ÇáÛÑÝÉ æäÙÇã ÇáæÌÈÇÊ";
    if (formData.type === "ÊÃÔíÑÉ") return "ãÏÉ ÇáÕáÇÍíÉ";
    return "ÇáÊÝÇÕíá / ÇáæÌåÉ";
  };
  
  const getPnrLabel = () => {
    if (formData.type === "ÊÐßÑÉ ØíÑÇä" || formData.type === "ØíÑÇä") return "ÑãÒ ÇáÍÌÒ (PNR)";
    if (formData.type === "ÝäÏÞ") return "ÑÞã ÇáÊÃßíÏ (Confirmation)";
    if (formData.type === "ÊÃÔíÑÉ") return "ÑÞã ÇáÌæÇÒ";
    return "ÇáÑÞã ÇáãÑÌÚí";
  };
  
  const getDateLabel = () => {
    if (formData.type === "ÊÐßÑÉ ØíÑÇä" || formData.type === "ØíÑÇä") return "ÊÇÑíÎ ÇáÐåÇÈ";
    if (formData.type === "ÝäÏÞ") return "ÊÇÑíÎ ÇáæÕæá (Check-in)";
    if (formData.type === "ÊÃÔíÑÉ") return "ÊÇÑíÎ ÇáÊÞÏíã";
    return "ÇáÊÇÑíÎ";
  };

  const getReturnDateLabel = () => {
    if (formData.type === "ÝäÏÞ") return "ÊÇÑíÎ ÇáãÛÇÏÑÉ (Check-out)";
    return "ÊÇÑíÎ ÇáÚæÏÉ (ÇÎÊíÇÑí)";
  };
`;

// Insert the logic functions right after the component starts. I will look for `const handleSave = (e: React.FormEvent) => {` and put it before it.
s = s.replace(
  "const handleSave = (e: React.FormEvent) => {",
  decodeURIComponent("%0A") + getLabelsLogic + decodeURIComponent("%0A") + "  const handleSave = (e: React.FormEvent) => {"
);

fs.writeFileSync("frontend/src/components/NewBookingModal.tsx", s, "utf8");

