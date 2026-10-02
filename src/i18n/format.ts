export function formatNumber(value: number, language: 'en' | 'hi' = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN').format(value);
}
export function formatRupees(value: number, language: 'en' | 'hi' = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
/** Percent with a sign, one decimal, Indian grouping: -0.5678 -> "-56.8%". */
export function formatPercent(fraction: number, language: 'en' | 'hi' = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(fraction);
}
/** Fills {named} placeholders in content strings; unknown names are left visible so gaps are caught in review. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
