export function getDayOfWeekMultiplier(): number {
  const day = new Date().getDay() // 0 = søn, 6 = lør
  if (day === 0 || day === 6) return 1.3 // Helg
  if (day === 5) return 1.1 // Fre
  return 0.9 // Vanlig ukedag
}
