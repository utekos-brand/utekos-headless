'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const SUPPRESSED_ROUTES: ReadonlyArray<string | RegExp> = ['/skreddersy-varmen']

function isSuppressed(pathname: string): boolean {
  return SUPPRESSED_ROUTES.some(rule =>
    typeof rule === 'string' ? pathname.startsWith(rule) : rule.test(pathname)
  )
}

export function ChatBotAgent() {
  const pathname = usePathname()

  if (isSuppressed(pathname)) {
    return null
  }

  const ChatBotAgentSourceCode = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="SO0afKtc9hg24ytkt83_9";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`
  return (
    <>
      <Script
        id='chatbot-agent'
        strategy='lazyOnload'
        dangerouslySetInnerHTML={{ __html: ChatBotAgentSourceCode }}
      />
    </>
  )
}
