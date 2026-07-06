/* eslint-disable quotes */
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind
} from 'react-email'
import * as React from 'react'

interface WelcomeEmailProps {
  email?: string
  discountCode?: string
}

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?
    process.env.NEXT_PUBLIC_APP_URL
  : ''

export const WelcomeEmail = ({
  email,
  discountCode = 'VELKOMMEN10'
}: WelcomeEmailProps) => {
  const previewText = `Velkommen til Utekos! Her er din rabattkode.`

  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: {
                DEFAULT: '#3c5e4b',
                light: '#e8edea',
                dark: '#2a4234'
              },
              text: { DEFAULT: '#333333', muted: '#666666' }
            }
          }
        }
      }}
    >
      <Head />
      <Preview>{previewText}</Preview>
      <Body className='mx-auto my-auto bg-gray-100 font-sans'>
        <Container className='mx-auto my-[40px] max-w-[600px] rounded border border-solid border-[#eaeaea] bg-white p-[20px]'>
          <article className='mt-[32px]'>
            <Img
              src={`${baseUrl}/icon.png`}
              width='60'
              height='60'
              alt='Utekos Logo'
              className='mx-auto my-0'
            />
          </article>
          <Heading className='text-text mx-0 my-[30px] p-0 text-center text-[24px] font-normal'>
            Velkommen til{' '}
            <span className='text-brand font-bold'>Utekos</span>
            -familien!
          </Heading>

          <Text className='text-text text-center text-[16px] leading-[24px]'>
            Vi er utrolig glade for at du vil følge oss. Nå er du
            den første til å få vite om produktnyheter,
            inspirasjon til uteplassen og eksklusive tilbud.
          </Text>
          <article className='bg-brand-light mx-auto my-8 rounded-lg p-6 text-center'>
            <Text className='text-brand-dark m-0 mb-2 text-[16px] font-medium'>
              Som en takk for at du meldte deg på, får du 10%
              rabatt på ditt første kjøp:
            </Text>
            <Heading
              as='h2'
              className='text-brand border-brand-dark/30 mx-0 my-4 inline-block rounded border-2 border-dashed bg-white px-6 py-2 text-[32px] font-bold tracking-wider'
            >
              {discountCode}
            </Heading>
            <Text className='text-text-muted m-0 mt-2 text-[14px]'>
              Bruk koden i kassen. Gyldig i 30 dager.
            </Text>
          </article>
          <article className='my-[32px] text-center'>
            <Button
              className='bg-brand hover:bg-brand-dark w-full rounded-md px-8 py-4 text-center text-[16px] font-semibold text-white no-underline sm:w-auto'
              href={`${baseUrl}/collections/all`}
            >
              Utforsk nettbutikken
            </Button>
          </article>

          <Hr className='mx-0 my-[26px] w-full border border-solid border-[#eaeaea]' />

          <article>
            <Row>
              <Column className='w-1/2 border-r border-gray-200 pr-4 pl-4 align-top'>
                <Heading
                  as='h3'
                  className='text-brand-dark m-0 mb-2 text-[16px] font-bold'
                >
                  Inspirasjon
                </Heading>
                <Text className='text-text-muted m-0 text-[14px]'>
                  Tips og triks for å skape den perfekte
                  uteplassen, uansett årstid.
                </Text>
              </Column>
              <Column className='w-1/2 pl-4 align-top'>
                <Heading
                  as='h3'
                  className='text-brand-dark m-0 mb-2 text-[16px] font-bold'
                >
                  Eksklusiv tilgang
                </Heading>
                <Text className='text-text-muted m-0 text-[14px]'>
                  Våre abonnenter får ofte tilgang til salg og
                  nyheter før alle andre.
                </Text>
              </Column>
            </Row>
          </article>

          <Hr className='mx-0 my-[26px] w-full border border-solid border-[#eaeaea]' />
          <article className='text-center'>
            <Text className='text-text-muted text-[12px] leading-[20px]'>
              Du mottar denne e-posten fordi du meldte deg på
              nyhetsbrevet vårt på Utekos.no.
            </Text>
            <Text className='text-text-muted text-[12px] leading-[20px]'>
              <Link
                href={`${baseUrl}/privacy-policy`}
                className='text-text-muted underline'
              >
                Personvernerklæring
              </Link>
            </Text>
            <Text className='text-text-muted mt-4 text-[12px] leading-[20px]'>
              © {new Date().getFullYear()} Utekos AS. Alle
              rettigheter reservert.
            </Text>
          </article>
        </Container>
      </Body>
    </Tailwind>
  )
}

export default WelcomeEmail
