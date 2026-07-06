export function TableRow({
  label,
  m,
  l
}: {
  label: string
  m: string
  l: string
}) {
  return (
    <tr className='hover:bg-[#F4F1EA]/5 transition-colors'>
      <td className='p-4 md:p-6 font-medium text-[#F4F1EA]/90'>{label}</td>
      <td className='p-4 md:p-6'>{m}</td>
      <td className='p-4 md:p-6'>{l}</td>
    </tr>
  )
}
