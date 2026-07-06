import Image from 'next/image'
import BoatView from '@public/magasinet/den-ultimate-hyggen.webp'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const music = [
  {
    title: 'Midnight City Lights',
    artist: 'Neon Dreams',
    album: 'Electric Nights',
    duration: '3:45'
  },
  {
    title: 'Coffee Shop Conversations',
    artist: 'The Morning Brew',
    album: 'Urban Stories',
    duration: '4:05'
  },
  {
    title: 'Digital Rain',
    artist: 'Cyber Symphony',
    album: 'Binary Beats',
    duration: '3:30'
  }
]

export function ItemImage() {
  return (
    <div className='mt-8 flex w-full max-w-md flex-col gap-6'>
      <ItemGroup className='gap-4'>
        {music.map(song => (
          <Item
            key={song.title}
            variant='outline'
            role='listitem'
            className='bg-item'
            render={
              <a href='#'>
                <ItemMedia variant='image'>
                  <Image src={BoatView} alt='Boat view' width={32} height={32} className='object-cover' />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className='line-clamp-1'>
                    {song.title} - <span className='text-muted-foreground text-muted-foreground'>{song.album}</span>
                  </ItemTitle>
                  <ItemDescription>{song.artist}</ItemDescription>
                </ItemContent>
                <ItemContent className='flex-none text-center'>
                  <ItemDescription>{song.duration}</ItemDescription>
                </ItemContent>
              </a>
            }
          />
        ))}
      </ItemGroup>
    </div>
  )
}
