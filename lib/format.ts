export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatArea(areaSqm: number): string {
  return `${formatNumber(areaSqm)} sqm`;
}

// The sequence backing this starts at 1001 (see the add_property_reference
// migration), so this is purely cosmetic formatting, not an offset.
export function formatReference(reference: number): string {
  return `BRE-${reference}`;
}

// Accepts a full "BRE-1042" reference or a bare "1042" and returns the
// numeric part, or null if the string doesn't look like one at all — used to
// let the admin search box match a reference as well as title/city.
export function parseReference(value: string): number | null {
  const match = value.trim().match(/^(?:BRE-)?(\d+)$/i);
  if (!match) return null;
  return Number(match[1]);
}
