export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatCurrencyWithDecimals(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getStatus(invoice) {
  const paymentStatus = invoice?.payment?.paymentstatus;
  if (paymentStatus && paymentStatus !== "Pending") return paymentStatus;
  if (invoice?.status === "Overdue") return "Overdue";
  if (paymentStatus) return paymentStatus;
  return invoice?.status === "Paid" ? "Paid" : "Pending";
}
