'use client'

import { useActionState } from 'react' // Eller bruk 'react-dom' avhengig av Next.js versjon
import { subscribeToNewsletter } from '@/lib/actions/subscribeToNewsLetters'

const initialState = { status: 'idle' as const, message: '' }

export default function TestNewsletterPage() {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState
  )

  return (
    <div className='  mx-auto mt-20 max-w-md rounded border border-border bg-card p-6 text-card-foreground shadow-lg'>
      <h1 className='mb-4 text-2xl font-bold'>
        Test Nyhetsbrev Flyt
      </h1>

      <form action={formAction} className='flex flex-col gap-4'>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            E-postadresse
          </label>
          <input
            name='email'
            type='email'
            placeholder='test+1@utekos.no'
            required
            className='border-input bg-background w-full rounded border border-input bg-background p-2 text-foreground'
          />
          <p className='text-foreground/90 mt-1 text-xs text-foreground/90'>
            Tips: Bruk alias (f.eks. din.epost+test1@gmail.com)
            for å teste flere ganger.
          </p>
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground rounded px-4 py-2 disabled:opacity-50'
        >
          {isPending ? 'Kjører...' : 'Test Påmelding'}
        </button>
      </form>

      {state.message && (
        <div
          className={`mt-4 rounded p-3 ${state.status === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground'}`}
        >
          <p className='font-bold'>
            {state.status === 'success' ? 'Suksess!' : 'Feil:'}
          </p>
          <p>{state.message}</p>
        </div>
      )}
    </div>
  )
}
