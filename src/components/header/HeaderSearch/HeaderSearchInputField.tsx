import { SearchIcon } from 'lucide-react'

export function HeaderSearchInputField({
  showShortcut = true
}: {
  showShortcut?: boolean
}) {
  return (
    <>
      <SearchIcon className='size-4 opacity-90' />
      <span>Søk</span>
      {showShortcut ? (
        <kbd
          aria-hidden
          className='pointer-events-none ml-auto inline-flex select-none items-center gap-1 rounded border border-sidebar-foreground/25 dark:border-dark-sidebar-foreground/25 bg-sidebar-foreground/10 dark:bg-dark-sidebar-foreground/10 px-1.5 font-mono text-[10px] text-sidebar-foreground dark:text-dark-sidebar-foreground'
        >
          <span className='text-xs'>⌘</span>K
        </kbd>
      ) : null}
    </>
  )
}
