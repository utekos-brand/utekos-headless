export function AmbientBackgroundGlow() {
  return (
    <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden' aria-hidden='true'>
      <div
        className='absolute left-[-30%] top-[-18%] size-[520px] opacity-[0.08] blur-[96px] sm:size-[680px] sm:blur-[120px] lg:size-[800px]'
        style={{
          background: 'radial-gradient(circle, var(--ancient-water) 0%, transparent 70%)'
        }}
      />
      <div
        className='absolute right-[-35%] bottom-[-20%] size-[520px] opacity-[0.08] blur-[96px] sm:size-[680px] sm:blur-[120px] lg:size-[800px]'
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)'
        }}
      />
    </div>
  )
}
