export function formatNumber(value: number, language: 'en' | 'hi' = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN').format(value);
}
export function formatRupees(value: number, language: 'en' | 'hi' = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
