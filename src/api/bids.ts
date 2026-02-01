import { apiFetch } from './client'
import type { Bid, BidRequest } from '../types/api'

export function listBids(productId: number): Promise<Bid[]> {
  return apiFetch(`/api/products/${productId}/bids`)
}

export function placeBid(productId: number, request: BidRequest): Promise<Bid> {
  return apiFetch(`/api/products/${productId}/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}
