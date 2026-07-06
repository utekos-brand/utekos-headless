export function UsageGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className='mb-3 border-b border-background/20 dark:border-dark-background/20 pb-1   text-lg text-background dark:text-dark-background'>{title}</h4>
      <ul className='list-inside list-disc space-y-1 text-sm text-background/82 dark:text-dark-background/82'>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
