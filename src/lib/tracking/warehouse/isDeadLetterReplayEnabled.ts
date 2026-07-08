export function isDeadLetterReplayEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DEAD_LETTER_REPLAY_ENABLED === '1'
}
