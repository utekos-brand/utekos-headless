import { BLOCKED_USER_AGENTS } from '@/api/constants/monitoring'

export function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false

  const normalizedAgent = userAgent.toLowerCase()

  return BLOCKED_USER_AGENTS.some(agent =>
    normalizedAgent.includes(agent.toLowerCase())
  )
}
