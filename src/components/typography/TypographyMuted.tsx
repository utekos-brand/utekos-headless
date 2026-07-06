export function Muted({ Text }: { Text: string }) {
  return (
    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{Text}</p>
  )
}
