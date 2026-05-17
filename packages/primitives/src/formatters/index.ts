const pad = (num: number): string => num.toString().padStart(2, "0");

export const formatFullDate = (date: Date, withoutTime?: boolean): string => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dateStr = `${monthNames[date.getMonth()]} ${pad(date.getDate())}, ${date.getFullYear()}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (withoutTime) return dateStr;
  return `${dateStr} at ${timeStr}`;
};

export const formatCurrency = (value: number, currency = "USD", locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};

export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions | boolean = {
    month: "long",
    day: "numeric",
    year: "numeric",
  },
  locale = "en-US",
): string => {
  const d = new Date(date);
  if (typeof options === "boolean") {
    const withoutTime = options;
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (withoutTime) return `${dateStr}`;
    return `${dateStr}, ${timeStr}`;
  }
  return new Intl.DateTimeFormat(locale, options).format(d);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {
    notation: "compact",
    maximumFractionDigits: 1,
  },
  locale = "en-US",
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};
