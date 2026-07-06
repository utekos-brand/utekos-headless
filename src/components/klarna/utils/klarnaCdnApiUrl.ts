/**
 * @klarna-agent
 * @id klarna-cdn-api-url
 * @title Klarna Payments CDN API URL constant
 * @domain Klarna
 * @kind utility
 * @export KLARNA_CDN_API_URL
 * @docs-index /src/components/klarna/agents.txt
 * @dependencies dev/docs/markdown/latest-official/web-payments/klarna-payments-SDK-reference/README.md
 */
export const KLARNA_CDN_API_URL = 'https://x.klarnacdn.net/kp/lib/v1/api.js' as const

export type KlarnaCdnApiUrl = typeof KLARNA_CDN_API_URL
