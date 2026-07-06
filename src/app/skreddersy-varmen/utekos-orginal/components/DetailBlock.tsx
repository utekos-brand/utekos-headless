export function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <li>
      <h4 className='mb-1 text-base font-bold text-background dark:text-dark-background'>{title}</h4>
      <p className='text-sm leading-text-paragraph text-background/82 dark:text-dark-background/82 md:text-base'>{text}</p>
    </li>
  )
}
