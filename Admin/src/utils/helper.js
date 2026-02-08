// CineGo / Admin / src / utils / helper.js
export const formatSlot = (date) => {
  if (!(date instanceof Date)) date = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const fmtLKR = (num) =>
  typeof num === "number"
    ? `LKR${num.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`
    : "LKR 0";

export function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

export function getImageUrl(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${import.meta.env.VITE_BASEURL}/uploads/${cleaned}`;
}
