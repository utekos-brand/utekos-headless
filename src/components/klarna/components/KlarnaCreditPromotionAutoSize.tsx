/**
 * @klarna-agent
 * @id klarna-credit-promotion-auto-size
 * @title Klarna OSM credit promotion auto-size
 * @domain Klarna
 * @kind osm-placement
 * @export KlarnaCreditPromotionAutoSize
 * @docs-index /src/components/klarna/agents.txt
 * @data-key credit-promotion-auto-size
 * @locale no-NO
 * @dependencies dev/docs/markdown/latest-official/on-site-messaging/product-and-cart-placements.md
 */
// Path: src/components/klarna/components/KlarnaCreditPromotionAutoSize.tsx

type KlarnaCreditPromotionAutoSizeProps = {
  id?: string
  purchaseAmount?: number | string
}

export function KlarnaCreditPromotionAutoSize({
  id,
  purchaseAmount = ''
}: KlarnaCreditPromotionAutoSizeProps) {
  return (
    <klarna-placement
      id={id}
      data-key='credit-promotion-auto-size'
      data-locale='no-NO'
      data-theme='dark'
      data-purchase-amount={purchaseAmount}
    ></klarna-placement>
  )
}

/** Original code from Klarna documentation */

/* ```html
 <klarna-placement
      data-key="credit-promotion-auto-size"
      data-locale="no-NO"
  data-purchase-amount=""
    ></klarna-placement>
    ``` */
