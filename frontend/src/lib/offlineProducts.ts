import lunr from 'lunr'
import type { Product } from './products'

const CACHE_KEY = 'gabonprice:offline-products'

export function cacheProducts(products: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products))
  } catch {
    // storage full or unavailable — offline search just won't have data, non-fatal
  }
}

export function getCachedProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]')
  } catch {
    return []
  }
}

let cachedIndex: lunr.Index | null = null
let indexedProducts: Product[] = []

function buildIndex(products: Product[]): lunr.Index {
  return lunr(function (this: lunr.Builder) {
    this.ref('id')
    this.field('name')
    this.field('category')
    for (const product of products) {
      this.add(product)
    }
  })
}

export function searchOfflineProducts(query: string): Product[] {
  const products = getCachedProducts()
  if (!query.trim()) return products

  if (!cachedIndex || indexedProducts !== products) {
    cachedIndex = buildIndex(products)
    indexedProducts = products
  }

  try {
    const results = cachedIndex.search(`${query.trim()}*`)
    const byId = new Map(products.map((p) => [p.id, p]))
    return results.map((r) => byId.get(r.ref)).filter((p): p is Product => !!p)
  } catch {
    // lunr throws on malformed query syntax (e.g. lone special chars) — fall back to substring match
    const needle = query.trim().toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(needle))
  }
}
