export function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-2 border-b border-background/12 dark:border-dark-background/12 pb-1 last:border-0 md:justify-start'>
      <span className='w-32 shrink-0 font-semibold text-background dark:text-dark-background'>{label}:</span>
      <span className='text-background/82 dark:text-dark-background/82'>{value}</span>
    </div>
  )
}
