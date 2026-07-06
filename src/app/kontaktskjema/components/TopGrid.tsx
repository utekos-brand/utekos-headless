// Path: src/app/kontaktskjema/sections/TopGrid.tsx
export function TopGrid() {
  return (
    <div className='hidden h-24 border-l border-r border-t border-cloud-dancer/[0.08] lg:block'>
      <div className='grid h-full grid-cols-12'>
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={`top-${i}`}
            className='h-full border-r border-cloud-dancer/[0.08]'
          />
        ))}
        <div className='h-full' />
      </div>
    </div>
  )
}
