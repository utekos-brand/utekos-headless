import { Ruler } from 'lucide-react'

export function SizeFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='w-12 h-12 rounded-full bg-[#2C2420] border border-[#F4F1EA]/10 flex items-center justify-center mb-4 text-[#E07A5F]'>
        <Ruler size={20} />
      </div>
      <h4 className='text-[#F4F1EA] font-medium mb-2'>{title}</h4>
      <p className='text-sm text-[#F4F1EA]/60 leading-relaxed max-w-xs'>
        {desc}
      </p>
    </div>
  )
}
