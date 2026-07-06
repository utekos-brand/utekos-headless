import { CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils/className'
import { TablerArrowRight } from './TablerArrowRight'
import type { SearchItem } from '@types'
export function ItemRow({
  item,
  depth,
  onSelect
}: {
  item: SearchItem
  depth: number
  onSelect: (path: string) => void
}) {
  const paddings = ['pl-0', 'pl-6', 'pl-10', 'pl-14', 'pl-16']
  const pad = paddings[Math.min(depth, paddings.length - 1)]

  const handleSelect = () => onSelect(item.path)
  const handleChildSelect = (path: string) => onSelect(path)

  return (
    <>
      <CommandItem
        value={`${item.title} ${item.path} ${(item.keywords || []).join(' ')}`}
        onSelect={handleSelect}
        className={cn(
          'h-9 rounded-md px-3 font-medium',
          depth > 0 && '/80 text-foreground/80',
          depth > 0 && pad
        )}
      >
        <TablerArrowRight className='size-4' />
        <span className='truncate'>{item.title}</span>
      </CommandItem>
      {depth === 0 &&
        (item.children || []).map(child => (
          <CommandItem
            key={child.id}
            value={`${child.title} ${child.path} ${(child.keywords || []).join(' ')}`}
            onSelect={() => handleChildSelect(child.path)}
            className={cn(
              'h-9 rounded-md px-3',
              '/70 pl-8 text-sm text-foreground/70'
            )}
          >
            <span aria-hidden className='mr-1'>
              ↳
            </span>
            <span className='truncate'>{child.title}</span>
          </CommandItem>
        ))}
    </>
  )
}
