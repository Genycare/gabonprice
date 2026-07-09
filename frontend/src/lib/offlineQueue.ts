import { createPrice, type NewPrice } from './products'

const QUEUE_KEY = 'gabonprice:offline-price-queue'

export interface QueuedPrice {
  id: string
  userId: string
  price: NewPrice
  productName: string
  productCategory: string
  queuedAt: string
}

function readQueue(): QueuedPrice[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedPrice[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueuePrice(entry: Omit<QueuedPrice, 'id' | 'queuedAt'>): QueuedPrice {
  const queued: QueuedPrice = { ...entry, id: crypto.randomUUID(), queuedAt: new Date().toISOString() }
  writeQueue([...readQueue(), queued])
  return queued
}

export function getQueuedPrices(): QueuedPrice[] {
  return readQueue()
}

export function getQueueCount(): number {
  return readQueue().length
}

export async function syncOfflinePrices(onChange?: () => void): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) return

  const remaining: QueuedPrice[] = []
  for (const entry of queue) {
    try {
      await createPrice(entry.userId, entry.price)
    } catch {
      remaining.push(entry)
    }
  }
  writeQueue(remaining)
  onChange?.()
}
