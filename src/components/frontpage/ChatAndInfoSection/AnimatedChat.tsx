import { NameCursor } from '@/components/chat/NameCursor'
import { SendIcon } from '@/components/icon/SendIcon'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  Message,
  MessageContent,
  MessageGroup
} from '@/components/ui/message'
import { motion, type Variants } from 'motion/react'
import { P } from '@/components/typography/TypographyP'
import { InlineText } from '@/components/typography/TypographyInlineText'

const chatMotion = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.12, staggerChildren: 0.12 }
  }
} satisfies Variants

const messageMotion = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] }
  }
} satisfies Variants

const chatBubbleClassName = 'max-w-xs sm:max-w-sm'

/*
  Hanne (incoming): accent — ink on cloud 12.55:1 (light),
  soft on tone-30 ~10:1 (dark). WCAG 1.4.3 AA.
*/
const incomingBubbleContentClassName =
  '!rounded-2xl !rounded-tl-md !border !border-[color-mix(in_oklch,var(--accent-foreground)_12%,transparent)] !bg-accent dark:!bg-accent !p-3 !text-base !leading-snug !text-accent-foreground dark:!text-accent-foreground shadow-lg shadow-background/15'

/*
  Thomas (outgoing): foreground on background — 14.28:1 (light),
  12.55:1 (dark). WCAG 1.4.3 AA.
*/
const outgoingBubbleContentClassName =
  '!rounded-2xl !rounded-tr-md !border !border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] !bg-foreground dark:!bg-foreground !p-3 !text-base !leading-snug !text-background dark:!text-background shadow-lg shadow-background/15'

export function AnimatedChat() {
  return (
    <motion.div
      variants={chatMotion}
      className='relative mx-auto flex h-full min-h-100 flex-col justify-center p-4 pt-4 sm:p-8'
    >
      <MessageGroup className='gap-8'>
        <motion.div variants={messageMotion}>
          <Message align='start'>
            <MessageContent>
              <Bubble
                align='start'
                variant='outline'
                className={chatBubbleClassName}
              >
                <BubbleContent
                  className={incomingBubbleContentClassName}
                >
                  <P className='chat-bubble-text not-first:mt-0'>
                    Husk å pakke noe skikkelig varmt til kvelden
                    på hytten, det blir fort kaldt 🥶
                  </P>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </motion.div>
        <motion.div
          variants={messageMotion}
          className='flex justify-end pr-8 md:hidden'
        >
          <NameCursor
            name='Hanne'
            side='left'
            color='var(--secondary)'
            foreground='var(--secondary-foreground)'
          />
        </motion.div>
        <motion.div variants={messageMotion}>
          <Message align='end'>
            <MessageContent>
              <Bubble
                align='end'
                className={chatBubbleClassName}
              >
                <BubbleContent
                  className={outgoingBubbleContentClassName}
                >
                  <P className='chat-bubble-text not-first:mt-0'>
                    Slapp av, jeg tar med Utekosen min. Den er
                    alt vi trenger.
                  </P>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </motion.div>

        <motion.div
          variants={messageMotion}
          className='flex justify-start pl-8 md:hidden'
        >
          <NameCursor
            name='Thomas'
            side='right'
            color='var(--foreground)'
            foreground='var(--background)'
          />
        </motion.div>

        <motion.div variants={messageMotion}>
          <Message align='start'>
            <MessageContent>
              <Bubble
                align='start'
                variant='outline'
                className={chatBubbleClassName}
              >
                <BubbleContent
                  className={incomingBubbleContentClassName}
                >
                  <P className='chat-bubble-text not-first:mt-0'>
                    Genialt! Da slipper vi å drasse med oss de
                    gamle pleddene.
                  </P>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </motion.div>

        <motion.div variants={messageMotion} className='mt-2'>
          <Message align='end'>
            <MessageContent>
              <Bubble align='end' className='max-w-[82%]'>
                <BubbleContent
                  className={outgoingBubbleContentClassName}
                >
                  <div className='flex items-center gap-2'>
                    <P className='chat-bubble-text flex items-center whitespace-nowrap text-background not-first:mt-0'>
                      <InlineText>
                        Nettopp. Mer plass til vinen 😉
                      </InlineText>
                      <motion.span
                        className='bg-background ml-1 inline-block h-4 w-0.5'
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{
                          duration: 0.9,
                          ease: 'easeInOut',
                          repeat: Infinity
                        }}
                      />
                    </P>
                    <span
                      className='hidden size-5 shrink-0 items-center justify-center rounded-md bg-transparent text-background sm:inline-flex'
                      aria-hidden
                      title='Send'
                    >
                      <SendIcon className='size-5' />
                    </span>
                  </div>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </motion.div>
      </MessageGroup>
      <div className='hidden md:block'>
        <NameCursor
          name='Hanne'
          side='left'
          color='var(--secondary)'
          foreground='var(--secondary-foreground)'
          className='absolute top-[22%] right-[15%]'
        />
        <NameCursor
          name='Thomas'
          side='right'
          color='var(--foreground)'
          foreground='var(--background)'
          className='absolute top-[42%] left-[18%]'
        />
      </div>
    </motion.div>
  )
}
