export function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-2 border-b pb-1 last:border-0 md:justify-start'>
      <span className='w-32 shrink-0 font-semibold text-background'>{label}:</span>
      <span className='text-background/82'>{value}</span>
    </div>
  )
}
