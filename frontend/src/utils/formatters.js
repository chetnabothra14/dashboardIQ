export function fmtINR(n) {
  if (!n && n !== 0) return '₹0';
  if (n >= 1e7) return `₹${(n/1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n/1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n/1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export function fmtINRAxis(n) {
  if (n >= 1e7) return `₹${(n/1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n/1e5).toFixed(0)}L`;
  if (n >= 1e3) return `₹${(n/1e3).toFixed(0)}K`;
  return `₹${n}`;
}

export const num = v => parseFloat(String(v).replace(/[₹$,\s]/g, '')) || 0;
