export function formatMoney(amount: number, currency: string) {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${currency || "INR"} ${Math.round(safeAmount).toLocaleString("en-IN")}`;
  }
}

