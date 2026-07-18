import * as React from 'react'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset
} from 'react-email'

interface WelcomeEmailProps {
  email?: string
}

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://utekos.no'
).replace(/\/$/, '')

const unsubscribeHref =
  'mailto:kundeservice@utekos.no?subject=Avmelding%20fra%20nyhetsbrev'

export function WelcomeEmail({ email }: WelcomeEmailProps) {
  const previewText =
    'Inspirasjon, produktnyheter og gode tips for mer tid ute.'

  return (
    <Html lang='nb'>
      <Tailwind
        config={{
          presets: [pixelBasedPreset]
        }}
      >
        <Head />
        <Preview>{previewText}</Preview>
        <Body className='m-0 bg-[#e7efee] px-[12px] py-[32px] font-sans text-[#173d3a]'>
          <Container className='mx-auto max-w-[600px] overflow-hidden rounded-[24px] bg-white'>
            <Section className='bg-[#00343e] px-[36px] py-[40px] text-center'>
              <Img
                src={`${siteUrl}/icon.png`}
                width='88'
                height='88'
                alt='Utekos'
                className='mx-auto mb-[26px] block'
              />
              <Text className='m-0 mb-[12px] text-[13px] font-bold leading-[18px] tracking-[1.5px] text-[#8dd8d0]'>
                HYGGELIG Å HA DEG MED
              </Text>
              <Heading
                as='h1'
                className='m-0 text-[38px] font-bold leading-[42px] tracking-[-1px] text-[#f0eee9]'
              >
                Velkommen inn i varmen
              </Heading>
              <Text className='mx-auto mt-[18px] mb-[28px] max-w-[440px] text-[17px] leading-[27px] text-[#f0eee9]'>
                Du får inspirasjon, produktnyheter og nyttige tips
                som gjør det enklere å nyte mer tid ute.
              </Text>
              <Button
                href={`${siteUrl}/produkter`}
                className='box-border block w-full rounded-[12px] bg-[#007a74] px-[24px] py-[15px] text-center text-[16px] font-bold leading-[22px] text-white no-underline'
              >
                Finn din Utekos
              </Button>
            </Section>

            <Img
              src={`${siteUrl}/email/welcome-hero.jpg`}
              width='600'
              height='315'
              alt='To venner som nyter en varm stund ute i Utekos'
              className='block h-auto w-full'
            />

            <Section className='px-[36px] py-[40px]'>
              <Heading
                as='h2'
                className='m-0 mb-[10px] text-[26px] font-bold leading-[32px] tracking-[-0.4px] text-[#00343e]'
              >
                Dette kan du glede deg til
              </Heading>
              <Text className='m-0 mb-[28px] text-[16px] leading-[25px] text-[#365c58]'>
                Vi sender bare innhold som gir deg noe nyttig,
                inspirerende eller relevant fra Utekos.
              </Text>

              <Row>
                <Column className='w-[48px] align-top'>
                  <Text className='m-0 text-[20px] font-bold leading-[28px] text-[#007a74]'>
                    01
                  </Text>
                </Column>
                <Column className='align-top'>
                  <Text className='m-0 text-[16px] font-bold leading-[24px] text-[#00343e]'>
                    Inspirasjon til flere stunder ute
                  </Text>
                  <Text className='m-0 mt-[4px] text-[15px] leading-[23px] text-[#365c58]'>
                    Ideer for terrasse, hytte, båtliv, bobil og
                    hverdager med frisk luft.
                  </Text>
                </Column>
              </Row>

              <Hr className='my-[22px] border-0 border-t border-solid border-[#d6e3e1]' />

              <Row>
                <Column className='w-[48px] align-top'>
                  <Text className='m-0 text-[20px] font-bold leading-[28px] text-[#007a74]'>
                    02
                  </Text>
                </Column>
                <Column className='align-top'>
                  <Text className='m-0 text-[16px] font-bold leading-[24px] text-[#00343e]'>
                    Nyheter og gode produktråd
                  </Text>
                  <Text className='m-0 mt-[4px] text-[15px] leading-[23px] text-[#365c58]'>
                    Enklere valg, bedre bruk og nytt fra sortimentet.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className='bg-[#f0eee9] px-[36px] py-[32px]'>
              <Heading
                as='h2'
                className='m-0 text-[22px] font-bold leading-[28px] text-[#00343e]'
              >
                Lurer du på noe?
              </Heading>
              <Text className='m-0 mt-[8px] text-[15px] leading-[24px] text-[#365c58]'>
                Vi hjelper deg gjerne. Svar på denne e-posten eller{' '}
                <Link
                  href={`${siteUrl}/kontaktskjema`}
                  className='font-bold text-[#005f5a] underline'
                >
                  kontakt kundeservice
                </Link>
                .
              </Text>
            </Section>

            <Section className='px-[36px] py-[28px] text-center'>
              <Text className='m-0 text-[12px] leading-[19px] text-[#526b68]'>
                Du mottar denne e-posten fordi du meldte deg på
                nyhetsbrevet vårt
                {email ? ` med ${email}` : ''}.
              </Text>
              <Text className='m-0 mt-[10px] text-[12px] leading-[19px]'>
                <Link
                  href={`${siteUrl}/personvern`}
                  className='text-[#365c58] underline'
                >
                  Personvern
                </Link>
                <span className='text-[#8aa09d]'> · </span>
                <Link
                  href={unsubscribeHref}
                  className='text-[#365c58] underline'
                >
                  Meld meg av
                </Link>
              </Text>
              <Text className='m-0 mt-[14px] text-[11px] leading-[18px] text-[#6b817e]'>
                KELC AS · Lille Damsgårdsveien 25 · 5162 Laksevåg
                <br />© {new Date().getFullYear()} Utekos. Alle
                rettigheter forbeholdt.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

WelcomeEmail.PreviewProps = {
  email: 'kunde@eksempel.no'
} satisfies WelcomeEmailProps

export default WelcomeEmail
