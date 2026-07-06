// Path: src/lib/tracking/google/mapToGA4EventName.ts

export function mapToGA4EventName(metaName: string): string {
  const map: Record<string, string> = {
    Purchase: 'purchase',
    AddToCart: 'add_to_cart',
    InitiateCheckout: 'begin_checkout',
    ViewContent: 'view_item',
    ViewCategory: 'view_item_list',
    ViewItemList: 'view_item_list',
    SelectItem: 'select_item',
    PageView: 'page_view',
    Lead: 'generate_lead'
  }
  return map[metaName] || metaName.toLowerCase().replace(/\s+/g, '_')
}
