/* -------- Format a Date into a readable slot date & time (12-hour format) -------- */
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

/* -------- Format number into Sri Lankan Rupees (LKR) -------- */
export const fmtLKR = (num) =>
  typeof num === "number"
    ? `LKR${num.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`
    : "LKR 0";

/* -------- Get saved login token from localStorage -------- */
export function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

/* -------- Convert image path to full URL if needed -------- */
export function getImageUrl(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${import.meta.env.VITE_BASEURL}/uploads/${cleaned}`;
}

/* -------- Show movie duration in hours and minutes -------- */
export function displayDuration(item) {
  if (!item || !item.duration) return "";

  if (typeof item.duration === "object") {
    const h = Number(item.duration.hours || 0);
    const m = Number(item.duration.minutes || 0);
    if (!h && !m) return "";
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  const totalMins = Number(item.duration);
  if (!Number.isFinite(totalMins) || totalMins <= 0) return "";

  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/* -------- Format movie slot (date + time + AM/PM) for display -------- */
export function formatSlotLM(s) {
  try {
    const d = s.date ? new Date(s.date + "T00:00:00") : null;
    const dayName = d
      ? d.toLocaleDateString(undefined, { weekday: "short" })
      : "";

    const dateStr = d ? d.toLocaleDateString() : s.date || "";
    const time = s.time || "";
    const ampm = s.ampm || "";
    return `${dayName} ${dateStr} - ${time} ${ampm}`.trim();
  } catch (error) {
    return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
  }
}
