export function TypographyLead({
  text,
  text2
}: {
  text: string
  text2?: string
}) {
  return (
    <p
      className='max-w-5xltext-left font-utekos-text leading-normal text-foreground'
      style={{
        fontSize: 'clamp(1.35rem, 1.4vw + 1rem, 1.95rem)',
        lineHeight: '1.35'
      }}
    >
      {text}
      {text2 && <br />}
      {text2 && <span className='text-foreground'>{text2}</span>}
    </p>
  )
}
