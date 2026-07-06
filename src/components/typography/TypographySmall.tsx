export function Small({ Text }: { Text: string }) {
  return (
    <p>
     <small className="text-sm leading-none font-utekos-text-medium">{Text}</small>
  </p>
  )
}

