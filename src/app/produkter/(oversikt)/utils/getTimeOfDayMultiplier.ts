export function getTimeOfDayMultiplier(): number {
  const hour = new Date().getHours()
  if (hour >= 1 && hour < 7) return 0.3 // Natt
  if (hour >= 7 && hour < 17) return 0.8 // Dagtid
  if (hour >= 17 && hour < 23) return 1.2 // Kveld
  return 0.9 // Sen kveld
}
